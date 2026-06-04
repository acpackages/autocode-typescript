import { describe, it, expect, vi } from "vitest";
import { AcReactivity, RAW_TARGET, metadataStore, IAcReactiveChange } from "../src/ac-reactivity";

describe("AcReactivity", () => {
    it("should preserve original instance identity, prototypes, and properties", () => {
        class User {
            public name: string;
            constructor(name: string) {
                this.name = name;
            }
            public greet() {
                return `Hello ${this.name}`;
            }
        }

        const original = new User("Alice");
        const reactive = AcReactivity.makeReactive({
            instance: original,
            properties: ["name"],
            onChange: () => {}
        });

        // Preserve identity
        expect(reactive).toBe(original);
        // Preserve prototype
        expect(Object.getPrototypeOf(reactive)).toBe(User.prototype);
        expect(reactive instanceof User).toBe(true);
        // Preserve methods
        expect(reactive.greet()).toBe("Hello Alice");
    });

    it("should handle primitive reactivity with O(1) change events", () => {
        const instance = {
            count: 10,
            name: "John"
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["count", "name"],
            onChange: (c) => changes.push(c)
        });

        reactive.count = 20;
        reactive.name = "Jane";

        expect(changes.length).toBe(2);
        expect(changes[0]).toMatchObject({
            property: "count",
            rootProperty: "count",
            oldValue: 10,
            newValue: 20,
            type: "primitive",
            operation: "set"
        });
        expect(changes[1]).toMatchObject({
            property: "name",
            rootProperty: "name",
            oldValue: "John",
            newValue: "Jane",
            type: "primitive",
            operation: "set"
        });
    });

    it("should handle nested object reactivity using deep lazy proxies", () => {
        const instance = {
            user: {
                name: "John",
                address: {
                    city: "Boston"
                }
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["user.name", "user.address.city"],
            onChange: (c) => changes.push(c)
        });

        // Modify deep property
        reactive.user.address.city = "New York";

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "user.address.city",
            rootProperty: "user",
            oldValue: "Boston",
            newValue: "New York",
            type: "primitive",
            operation: "set"
        });
    });

    it("should prevent repeated wrapping and preserve proxy references", () => {
        const instance = {
            user: {
                name: "John"
            }
        };

        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["user.name"],
            onChange: () => {}
        });

        const firstProxy = reactive.user;
        const secondProxy = reactive.user;

        // Identity must be preserved across multiple reads
        expect(firstProxy).toBe(secondProxy);
    });

    it("should NOT track dependencies inside raw functions/methods", () => {
        const instance = {
            firstName: "John",
            lastName: "Doe",
            fullName() {
                return this.firstName + " " + this.lastName;
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["fullName"],
            onChange: (c) => changes.push(c)
        });

        reactive.firstName = "Jane";

        expect(changes.map(c => c.property)).not.toContain("fullName");
    });

    it("should support property deletion and track changes", () => {
        const instance: { user?: { name?: string } } = {
            user: {
                name: "John"
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["user.name"],
            onChange: (c) => changes.push(c)
        });

        delete reactive.user!.name;

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "user.name",
            rootProperty: "user",
            oldValue: "John",
            newValue: undefined,
            type: "primitive",
            operation: "delete"
        });
    });

    it("should handle array reactivity (mutating methods, length and indices)", () => {
        const instance = {
            items: [1, 2, 3]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["items"],
            onChange: (c) => changes.push(c)
        });

        // 1. push method (mutates array in place, should emit a single 'push' operation event)
        reactive.items.push(4);
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "items",
            rootProperty: "items",
            type: "array",
            operation: "push"
        });
        expect(reactive.items).toEqual([1, 2, 3, 4]);

        // 2. Index set mutation
        changes.length = 0;
        reactive.items[0] = 10;
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "items.0",
            rootProperty: "items",
            type: "array",
            operation: "set",
            oldValue: 1,
            newValue: 10
        });

        // 3. Length mutation
        changes.length = 0;
        reactive.items.length = 1;
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "items.length",
            rootProperty: "items",
            type: "array",
            operation: "length",
            oldValue: 4,
            newValue: 1
        });
    });

    it("should perform runtime type switching automatically", () => {
        const instance: { value: any } = {
            value: 10
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["value"],
            onChange: (c) => changes.push(c)
        });

        // Switch to object
        reactive.value = { name: "Alice" };
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "value",
            type: "object",
            operation: "set"
        });

        // Modify object nested property (deeply reactive now)
        changes.length = 0;
        reactive.value.name = "Bob";
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "value.name",
            type: "primitive",
            operation: "set",
            oldValue: "Alice",
            newValue: "Bob"
        });

        // Switch to array
        changes.length = 0;
        reactive.value = [100];
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "value",
            type: "array",
            operation: "set"
        });

        // Mutate array (deeply reactive now)
        changes.length = 0;
        reactive.value.push(200);
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "value",
            type: "array",
            operation: "push"
        });
    });

    it("should preserve original getters, setters, and descriptor properties", () => {
        let internalVal = 42;
        const gettersCalled: string[] = [];
        const settersCalled: string[] = [];

        const instance = {
            get code() {
                gettersCalled.push("get code");
                return internalVal;
            },
            set code(v: number) {
                settersCalled.push(`set code ${v}`);
                internalVal = v;
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["code"],
            onChange: (c) => changes.push(c)
        });

        // Verify read calls original getter
        expect(reactive.code).toBe(42);
        expect(gettersCalled).toEqual(["get code"]);

        // Verify write calls original setter and emits change
        reactive.code = 100;
        expect(internalVal).toBe(100);
        expect(settersCalled).toEqual(["set code 100"]);
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "code",
            oldValue: 42,
            newValue: 100,
            type: "primitive",
            operation: "set"
        });
    });

    it("should handle circular references safely without infinite recursion", () => {
        interface ICircular {
            name: string;
            self?: ICircular;
        }

        const instance: ICircular = {
            name: "Circular"
        };
        instance.self = instance;

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["name", "self"],
            onChange: (c) => changes.push(c)
        });

        // Writing to self.name should propagate cleanly
        reactive.self!.name = "Modified";

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "name",
            rootProperty: "name",
            oldValue: "Circular",
            newValue: "Modified",
            type: "primitive",
            operation: "set"
        });
    });

    it("should support batching and emit only the final state using queueMicrotask", async () => {
        const instance = {
            name: "Initial"
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["name"],
            onChange: (c) => changes.push(c),
            batch: true
        });

        reactive.name = "A";
        reactive.name = "B";
        reactive.name = "C";

        expect(changes.length).toBe(0); // Batched, not flushed yet

        await new Promise((resolve) => queueMicrotask(resolve));

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "name",
            oldValue: "Initial",
            newValue: "C",
            type: "primitive",
            operation: "set"
        });
    });

    it("should perform metadata cleanup and avoid memory leaks", () => {
        const instance = {
            child: {
                name: "Initial"
            }
        };
        const rawChild = instance.child;

        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["child.name"],
            onChange: () => {}
        });

        expect(metadataStore.has(rawChild)).toBe(true);

        // Replace child to trigger cleanup
        reactive.child = { name: "New" };

        // The old rawChild is no longer reachable from the root
        // Note: its parent link should be removed
        const meta = metadataStore.get(rawChild);
        expect(meta?.parents.length).toBe(0);
    });

    it("should correctly handle path filtering and ignore untracked properties", () => {
        const instance = {
            tracked: "yes",
            untracked: "no",
            user: {
                trackedName: "Alice",
                untrackedAge: 30
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["tracked", "user.trackedName"],
            onChange: (c) => changes.push(c)
        });

        reactive.untracked = "modified untracked";
        reactive.user.untrackedAge = 40;

        expect(changes.length).toBe(0); // Ignored untracked properties

        reactive.tracked = "modified tracked";
        reactive.user.trackedName = "Bob";

        expect(changes.length).toBe(2);
        expect(changes[0].property).toBe("tracked");
        expect(changes[1].property).toBe("user.trackedName");
    });

    it("should only make plain objects and arrays reactive, excluding class instances and simulated HTMLElements", () => {
        class CustomClass {
            public value: string;
            constructor(val: string) {
                this.value = val;
            }
        }

        class FakeHTMLElement {
            public tagName = "DIV";
            public innerHTML = "";
        }

        const instance = {
            custom: new CustomClass("hello") as any,
            element: new FakeHTMLElement() as any,
            plain: { value: "world" }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["custom.value", "element.innerHTML", "plain.value"],
            onChange: (c) => changes.push(c)
        });

        // Verify that plain object is wrapped in a proxy
        expect(reactive.plain[RAW_TARGET]).toBeDefined();

        // Verify that class instance and fake HTMLElement are NOT wrapped in a proxy
        expect(reactive.custom[RAW_TARGET]).toBeUndefined();
        expect(reactive.element[RAW_TARGET]).toBeUndefined();

        // Verify that modifying the plain object triggers change notification
        reactive.plain.value = "new world";
        expect(changes.length).toBe(1);

        // Verify that modifying class instance or element does NOT trigger change notifications
        changes.length = 0;
        reactive.custom.value = "new custom";
        reactive.element.innerHTML = "<span>new</span>";
        expect(changes.length).toBe(0);
    });

    it("should emit correct context (root, object, array) for each change", () => {
        const instance = {
            count: 10,
            user: {
                name: "John"
            },
            items: [1, 2, 3]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["count", "user.name", "items"],
            onChange: (c) => changes.push(c)
        });

        // 1. root change
        reactive.count = 20;
        expect(changes[0].context).toBe("root");

        // 2. object change
        reactive.user.name = "Jane";
        expect(changes[1].context).toBe("object");

        // 3. array change
        reactive.items.push(4);
        expect(changes[2].context).toBe("array");
    });

    it("should emit getter setter changes when getter/setter also had dependency on array", () => {
        const instance = {
            list: [1, 2, 3],
            get count() {
                return this.list.length;
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["list", "count"],
            onChange: (c) => changes.push(c)
        });

        // Mutate array using push
        reactive.list.push(4);

        // Verify we got a change event for count
        const countChange = changes.find(c => c.property === "count");
        expect(countChange).toBeDefined();
        expect(countChange).toMatchObject({
            property: "count",
            newValue: 4
        });
    });
});

