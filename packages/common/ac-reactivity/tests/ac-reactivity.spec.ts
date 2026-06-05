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
        // Note: its subscriptions should be cleaned up via cascading unsubscribe
        const meta = metadataStore.get(rawChild);
        expect(meta?.subscriptions.size).toBe(0);
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

    it("should emit getter setter changes when array object value changed", () => {
        const instance = {
            list: [{ val: 1 }, { val: 2 }],
            get total() {
                return this.list.reduce((acc, item) => acc + item.val, 0);
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["list", "total"],
            onChange: (c) => changes.push(c)
        });

        // Modifying a value inside an object in the array
        reactive.list[0].val = 10;

        // Verify we got a change event for total
        const totalChange = changes.find(c => c.property === "total");
        expect(totalChange).toBeDefined();
        expect(totalChange).toMatchObject({
            property: "total",
            newValue: 12
        });
    });

    it("should emit getter setter changes when array object value changed on newly inserted item in array", () => {
        const instance = {
            list: [{ val: 1 }, { val: 2 }],
            get total() {
                return this.list.reduce((acc, item) => acc + item.val, 0);
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["list", "total"],
            onChange: (c) => changes.push(c)
        });

        // Push a new object into the array
        reactive.list.push({ val: 3 });

        // Clear initial changes from push
        changes.length = 0;

        // Modifying a value inside the newly inserted object
        reactive.list[2].val = 10;

        // Verify we got a change event for total
        const totalChange = changes.find(c => c.property === "total");
        expect(totalChange).toBeDefined();
        expect(totalChange).toMatchObject({
            property: "total",
            newValue: 13
        });
    });

    it("should emit getter setter changes when array object value changed on a proxy item pushed to array", () => {
        const instance = {
            list: [{ val: 1 }, { val: 2 }],
            get total() {
                return this.list.reduce((acc, item) => acc + item.val, 0);
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["list", "total"],
            onChange: (c) => changes.push(c)
        });

        // Create a reactive proxy for the new item
        const newItemProxy = AcReactivity.makeReactive({
            instance: { val: 3 },
            properties: ["val"],
            onChange: () => {}
        });

        // Push the proxy
        reactive.list.push(newItemProxy);

        // Clear initial changes
        changes.length = 0;

        // Modifying the value on the pushed proxy directly
        newItemProxy.val = 10;

        // Verify we got a change event for total
        const totalChange = changes.find(c => c.property === "total");
        expect(totalChange).toBeDefined();
        expect(totalChange).toMatchObject({
            property: "total",
            newValue: 13
        });
    });

    // ═══════════════════════════════════════════════════════════
    // Deep Nesting Tests — Objects & Arrays at arbitrary depth
    // ═══════════════════════════════════════════════════════════

    it("should track changes 4 levels deep in nested objects", () => {
        const instance = {
            level1: {
                level2: {
                    level3: {
                        level4: {
                            value: "deep"
                        }
                    }
                }
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["level1.level2.level3.level4.value"],
            onChange: (c) => changes.push(c)
        });

        reactive.level1.level2.level3.level4.value = "modified";

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "level1.level2.level3.level4.value",
            rootProperty: "level1",
            oldValue: "deep",
            newValue: "modified",
            type: "primitive",
            operation: "set"
        });
    });

    it("should track replacing an object at depth 3 and then mutating the new object", () => {
        const instance: any = {
            a: {
                b: {
                    c: {
                        name: "original"
                    }
                }
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["a.b.c.name"],
            onChange: (c) => changes.push(c)
        });

        // Replace the entire nested object at depth 2
        reactive.a.b = { c: { name: "replaced" } };

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "a.b",
            rootProperty: "a",
            type: "object",
            operation: "set"
        });

        // Now mutate inside the NEW nested object
        changes.length = 0;
        reactive.a.b.c.name = "after-replace";

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "a.b.c.name",
            rootProperty: "a",
            oldValue: "replaced",
            newValue: "after-replace",
            type: "primitive",
            operation: "set"
        });
    });

    it("should track nested array inside nested object", () => {
        const instance = {
            config: {
                settings: {
                    tags: ["alpha", "beta"]
                }
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["config.settings.tags"],
            onChange: (c) => changes.push(c)
        });

        // Push into deeply nested array
        reactive.config.settings.tags.push("gamma");

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "config.settings.tags",
            rootProperty: "config",
            type: "array",
            operation: "push"
        });

        // Direct index set on deeply nested array
        changes.length = 0;
        reactive.config.settings.tags[0] = "ALPHA";

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "config.settings.tags.0",
            rootProperty: "config",
            oldValue: "alpha",
            newValue: "ALPHA",
            type: "array",
            operation: "set"
        });
    });

    it("should track objects inside a deeply nested array", () => {
        const instance = {
            data: {
                rows: [
                    { id: 1, info: { label: "first" } },
                    { id: 2, info: { label: "second" } }
                ]
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["data.rows"],
            onChange: (c) => changes.push(c)
        });

        // Modify a property inside an object inside the nested array
        reactive.data.rows[0].info.label = "FIRST";

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "data.rows.0.info.label",
            rootProperty: "data",
            oldValue: "first",
            newValue: "FIRST",
            type: "primitive",
            operation: "set",
            context: "object"
        });
    });

    it("should track splice on a deeply nested array", () => {
        const instance = {
            app: {
                state: {
                    items: [10, 20, 30, 40]
                }
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["app.state.items"],
            onChange: (c) => changes.push(c)
        });

        // splice: remove 2 elements at index 1, insert 1
        reactive.app.state.items.splice(1, 2, 99);

        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "app.state.items",
            rootProperty: "app",
            type: "array",
            operation: "splice"
        });
        expect(reactive.app.state.items).toEqual([10, 99, 40]);
    });

    it("should track shift/unshift on a deeply nested array", () => {
        const instance = {
            queue: {
                pending: [1, 2, 3]
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["queue.pending"],
            onChange: (c) => changes.push(c)
        });

        // shift
        reactive.queue.pending.shift();
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "queue.pending",
            type: "array",
            operation: "shift"
        });
        expect(reactive.queue.pending).toEqual([2, 3]);

        // unshift
        changes.length = 0;
        reactive.queue.pending.unshift(0);
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "queue.pending",
            type: "array",
            operation: "unshift"
        });
        expect(reactive.queue.pending).toEqual([0, 2, 3]);
    });

    it("should track sort and reverse on a deeply nested array", () => {
        const instance = {
            data: {
                scores: [3, 1, 4, 1, 5]
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["data.scores"],
            onChange: (c) => changes.push(c)
        });

        // sort
        reactive.data.scores.sort();
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "data.scores",
            type: "array",
            operation: "sort"
        });
        expect(reactive.data.scores).toEqual([1, 1, 3, 4, 5]);

        // reverse
        changes.length = 0;
        reactive.data.scores.reverse();
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "data.scores",
            type: "array",
            operation: "reverse"
        });
        expect(reactive.data.scores).toEqual([5, 4, 3, 1, 1]);
    });

    it("should track pop on a deeply nested array", () => {
        const instance = {
            stack: {
                frames: ["a", "b", "c"]
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["stack.frames"],
            onChange: (c) => changes.push(c)
        });

        const popped = reactive.stack.frames.pop();
        expect(popped).toBe("c");
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "stack.frames",
            type: "array",
            operation: "pop"
        });
        expect(reactive.stack.frames).toEqual(["a", "b"]);
    });

    // ═══════════════════════════════════════════════════════════
    // Getter/Setter Dependency Tests — arrays & objects
    // ═══════════════════════════════════════════════════════════

    it("should emit getter change when getter depends on a deeply nested object property", () => {
        const instance = {
            config: {
                theme: {
                    primary: "#ff0000"
                }
            },
            get themeColor() {
                return this.config.theme.primary;
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["config.theme.primary", "themeColor"],
            onChange: (c) => changes.push(c)
        });

        // Modify the deep dependency
        reactive.config.theme.primary = "#00ff00";

        // Should get a change for the direct property AND the getter
        const directChange = changes.find(c => c.property === "config.theme.primary");
        const getterChange = changes.find(c => c.property === "themeColor");

        expect(directChange).toBeDefined();
        expect(directChange).toMatchObject({
            property: "config.theme.primary",
            oldValue: "#ff0000",
            newValue: "#00ff00"
        });

        expect(getterChange).toBeDefined();
        expect(getterChange).toMatchObject({
            property: "themeColor",
            newValue: "#00ff00"
        });
    });

    it("should emit getter change when getter depends on nested array of objects with reduce", () => {
        const instance = {
            orders: {
                items: [
                    { product: "A", qty: 2, price: 10 },
                    { product: "B", qty: 1, price: 25 }
                ]
            },
            get orderTotal() {
                return this.orders.items.reduce((sum, item) => sum + item.qty * item.price, 0);
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["orders.items", "orderTotal"],
            onChange: (c) => changes.push(c)
        });

        // Verify initial getter value
        expect(reactive.orderTotal).toBe(45); // 2*10 + 1*25

        // Modify qty of first item
        reactive.orders.items[0].qty = 5;

        const totalChange = changes.find(c => c.property === "orderTotal");
        expect(totalChange).toBeDefined();
        expect(totalChange).toMatchObject({
            property: "orderTotal",
            newValue: 75 // 5*10 + 1*25
        });
    });

    it("should emit getter change when getter with setter depends on an array", () => {
        const instance = {
            tags: ["a", "b", "c"],
            get tagCount() {
                return this.tags.length;
            },
            set tagCount(_v: number) {
                // setter exists but does nothing meaningful — tests that
                // the dependency resolver handles get+set pairs
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["tags", "tagCount"],
            onChange: (c) => changes.push(c)
        });

        expect(reactive.tagCount).toBe(3);

        reactive.tags.push("d");

        const tagCountChange = changes.find(c => c.property === "tagCount");
        expect(tagCountChange).toBeDefined();
        expect(tagCountChange).toMatchObject({
            property: "tagCount",
            newValue: 4
        });
    });

    it("should emit getter change when getter depends on multiple nested paths", () => {
        const instance = {
            user: {
                firstName: "John",
                lastName: "Doe"
            },
            settings: {
                format: "full"
            },
            get displayName() {
                if (this.settings.format === "full") {
                    return this.user.firstName + " " + this.user.lastName;
                }
                return this.user.firstName;
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["user.firstName", "user.lastName", "settings.format", "displayName"],
            onChange: (c) => changes.push(c)
        });

        expect(reactive.displayName).toBe("John Doe");

        // Change one dependency
        reactive.user.firstName = "Jane";

        const nameChange = changes.find(c => c.property === "displayName");
        expect(nameChange).toBeDefined();
        expect(nameChange).toMatchObject({
            property: "displayName",
            newValue: "Jane Doe"
        });

        // Change the other dependency
        changes.length = 0;
        reactive.settings.format = "short";

        const formatChange = changes.find(c => c.property === "displayName");
        expect(formatChange).toBeDefined();
        expect(formatChange).toMatchObject({
            property: "displayName",
            newValue: "Jane"
        });
    });

    it("should emit getter change when pushing objects into array and then modifying them", () => {
        const instance = {
            employees: [] as { name: string; salary: number }[],
            get totalPayroll() {
                return this.employees.reduce((sum, e) => sum + e.salary, 0);
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["employees", "totalPayroll"],
            onChange: (c) => changes.push(c)
        });

        expect(reactive.totalPayroll).toBe(0);

        // Push first employee
        reactive.employees.push({ name: "Alice", salary: 50000 });
        let payrollChange = changes.find(c => c.property === "totalPayroll");
        expect(payrollChange).toBeDefined();
        expect(payrollChange!.newValue).toBe(50000);

        // Push second employee
        changes.length = 0;
        reactive.employees.push({ name: "Bob", salary: 60000 });
        payrollChange = changes.find(c => c.property === "totalPayroll");
        expect(payrollChange).toBeDefined();
        expect(payrollChange!.newValue).toBe(110000);

        // Modify salary of first employee
        changes.length = 0;
        reactive.employees[0].salary = 70000;
        payrollChange = changes.find(c => c.property === "totalPayroll");
        expect(payrollChange).toBeDefined();
        expect(payrollChange!.newValue).toBe(130000);
    });

    it("should track all array mutating methods on deeply nested arrays with getter dependency", () => {
        const instance = {
            data: {
                values: [5, 3, 8, 1]
            },
            get sum() {
                return this.data.values.reduce((a, b) => a + b, 0);
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["data.values", "sum"],
            onChange: (c) => changes.push(c)
        });

        expect(reactive.sum).toBe(17);

        // pop (removes 1)
        reactive.data.values.pop();
        let sumChange = changes.find(c => c.property === "sum");
        expect(sumChange).toBeDefined();
        expect(sumChange!.newValue).toBe(16);

        // shift (removes 5)
        changes.length = 0;
        reactive.data.values.shift();
        sumChange = changes.find(c => c.property === "sum");
        expect(sumChange).toBeDefined();
        expect(sumChange!.newValue).toBe(11);

        // unshift (adds 10)
        changes.length = 0;
        reactive.data.values.unshift(10);
        sumChange = changes.find(c => c.property === "sum");
        expect(sumChange).toBeDefined();
        expect(sumChange!.newValue).toBe(21);

        // splice (remove 1 at index 1, add 20) — removes 3, adds 20
        changes.length = 0;
        reactive.data.values.splice(1, 1, 20);
        sumChange = changes.find(c => c.property === "sum");
        expect(sumChange).toBeDefined();
        expect(sumChange!.newValue).toBe(38); // 10 + 20 + 8
    });

    // ═══════════════════════════════════════════════════════════
    // Newly inserted array item change detection
    // ═══════════════════════════════════════════════════════════

    it("should emit change when modifying a newly pushed object in a root-level array", () => {
        const instance = {
            items: [{ name: "existing" }] as { name: string }[]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["items"],
            onChange: (c) => changes.push(c)
        });

        // Existing item works
        reactive.items[0].name = "EXISTING";
        expect(changes.length).toBe(1);
        expect(changes[0].property).toBe("items.0.name");

        // Push new item
        changes.length = 0;
        reactive.items.push({ name: "new" });
        expect(changes.some(c => c.operation === "push")).toBe(true);

        // Modify the newly pushed item
        changes.length = 0;
        reactive.items[1].name = "NEW_MODIFIED";
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "items.1.name",
            rootProperty: "items",
            oldValue: "new",
            newValue: "NEW_MODIFIED",
            type: "primitive",
            operation: "set"
        });
    });

    it("should emit change when modifying a newly pushed object in a nested array", () => {
        const instance = {
            data: {
                rows: [{ id: 1, value: "a" }] as { id: number; value: string }[]
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["data.rows"],
            onChange: (c) => changes.push(c)
        });

        // Existing item works
        reactive.data.rows[0].value = "A";
        expect(changes.length).toBe(1);
        expect(changes[0].property).toBe("data.rows.0.value");

        // Push new item
        changes.length = 0;
        reactive.data.rows.push({ id: 2, value: "b" });

        // Modify the newly pushed item
        changes.length = 0;
        reactive.data.rows[1].value = "B";
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "data.rows.1.value",
            rootProperty: "data",
            oldValue: "b",
            newValue: "B",
            type: "primitive",
            operation: "set"
        });
    });

    it("should emit change when modifying deep properties inside a newly pushed object", () => {
        const instance = {
            users: [
                { profile: { address: { city: "Boston" } } }
            ] as any[]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["users"],
            onChange: (c) => changes.push(c)
        });

        // Push new user with deep nesting
        reactive.users.push({ profile: { address: { city: "NYC" } } });
        changes.length = 0;

        // Modify deep property on the newly pushed item
        reactive.users[1].profile.address.city = "LA";
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "users.1.profile.address.city",
            rootProperty: "users",
            oldValue: "NYC",
            newValue: "LA",
            type: "primitive",
            operation: "set"
        });
    });

    it("should emit change when modifying items pushed via splice", () => {
        const instance = {
            list: [{ v: 1 }] as { v: number }[]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["list"],
            onChange: (c) => changes.push(c)
        });

        // Insert via splice
        reactive.list.splice(1, 0, { v: 2 }, { v: 3 });
        changes.length = 0;

        // Modify spliced-in item
        reactive.list[1].v = 20;
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "list.1.v",
            oldValue: 2,
            newValue: 20
        });

        // Modify second spliced-in item
        changes.length = 0;
        reactive.list[2].v = 30;
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "list.2.v",
            oldValue: 3,
            newValue: 30
        });
    });

    it("should emit change when modifying items pushed via unshift", () => {
        const instance = {
            list: [{ v: 10 }] as { v: number }[]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["list"],
            onChange: (c) => changes.push(c)
        });

        // Insert at front via unshift
        reactive.list.unshift({ v: 0 });
        changes.length = 0;

        // Modify the unshifted item (now at index 0)
        reactive.list[0].v = 99;
        expect(changes.length).toBe(1);
        expect(changes[0]).toMatchObject({
            property: "list.0.v",
            oldValue: 0,
            newValue: 99
        });
    });

    // ═══════════════════════════════════════════════════════════
    // Proxy Guarantee Tests — always proxy for objects/arrays,
    // always raw for primitives
    // ═══════════════════════════════════════════════════════════

    it("should always return proxy from get traps for nested plain objects", () => {
        const instance = {
            user: {
                name: "John",
                address: {
                    city: "Boston"
                }
            }
        };

        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["user.name"],
            onChange: () => {}
        });

        // user is a plain object — must be proxied
        const user = reactive.user;
        expect((user as any)[RAW_TARGET]).toBeDefined();

        // address is a plain object — must be proxied even though "user.address" is not tracked
        const address = user.address;
        expect((address as any)[RAW_TARGET]).toBeDefined();
    });

    it("should always return proxy from get traps for arrays", () => {
        const instance = {
            items: [{ name: "a" }, { name: "b" }]
        };

        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["items"],
            onChange: () => {}
        });

        // items is an array — must be proxied
        const items = reactive.items;
        expect((items as any)[RAW_TARGET]).toBeDefined();

        // Each element is a plain object — must be proxied
        expect((items[0] as any)[RAW_TARGET]).toBeDefined();
        expect((items[1] as any)[RAW_TARGET]).toBeDefined();
    });

    it("should return raw primitives from get traps, never proxy", () => {
        const instance = {
            count: 42,
            name: "Alice",
            active: true,
            data: null as any
        };

        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["count", "name", "active", "data"],
            onChange: () => {}
        });

        // Primitives must be returned as-is (no proxy wrapping)
        expect(reactive.count).toBe(42);
        expect(typeof reactive.count).toBe("number");
        expect(reactive.name).toBe("Alice");
        expect(typeof reactive.name).toBe("string");
        expect(reactive.active).toBe(true);
        expect(typeof reactive.active).toBe("boolean");
        expect(reactive.data).toBeNull();
    });

    it("should emit proxied oldValue/newValue for object changes in change events", () => {
        const instance: any = {
            user: { name: "John" }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["user"],
            onChange: (c) => changes.push(c)
        });

        const newUser = { name: "Jane" };
        reactive.user = newUser;

        expect(changes.length).toBe(1);
        // newValue should be a proxy
        expect((changes[0].newValue as any)[RAW_TARGET]).toBeDefined();
        // oldValue should be a proxy
        expect((changes[0].oldValue as any)[RAW_TARGET]).toBeDefined();
    });

    it("should emit proxied oldValue/newValue for array changes in change events", () => {
        const instance: any = {
            items: [1, 2, 3]
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["items"],
            onChange: (c) => changes.push(c)
        });

        const newItems = [4, 5, 6];
        reactive.items = newItems;

        expect(changes.length).toBe(1);
        // newValue should be a proxy (it's an array)
        expect((changes[0].newValue as any)[RAW_TARGET]).toBeDefined();
        // oldValue should be a proxy (it was an array)
        expect((changes[0].oldValue as any)[RAW_TARGET]).toBeDefined();
    });

    it("should emit raw oldValue/newValue for primitive changes in change events", () => {
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
        // Primitive values should be raw, not proxied
        expect(changes[0].oldValue).toBe(10);
        expect(changes[0].newValue).toBe(20);
        expect(changes[1].oldValue).toBe("John");
        expect(changes[1].newValue).toBe("Jane");
    });

    it("should emit proxied newValue for getter dependency changes on objects", () => {
        const instance = {
            data: { items: [1, 2, 3] },
            get info() {
                return this.data;
            }
        };

        const changes: IAcReactiveChange[] = [];
        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["data", "info"],
            onChange: (c) => changes.push(c)
        });

        reactive.data = { items: [4, 5] };

        // info is a getter that returns this.data (an object) — its newValue should be proxied
        const infoChange = changes.find(c => c.property === "info");
        expect(infoChange).toBeDefined();
        if (infoChange && infoChange.newValue && typeof infoChange.newValue === "object") {
            expect((infoChange.newValue as any)[RAW_TARGET]).toBeDefined();
        }
    });

    it("should return proxy for untracked nested objects read through a tracked parent", () => {
        const instance = {
            config: {
                theme: {
                    primary: "#ff0000",
                    extra: {
                        shadow: "none"
                    }
                }
            }
        };

        const reactive = AcReactivity.makeReactive({
            instance,
            properties: ["config.theme.primary"],
            onChange: () => {}
        });

        // config is tracked — must be proxied
        expect((reactive.config as any)[RAW_TARGET]).toBeDefined();

        // theme is tracked — must be proxied
        expect((reactive.config.theme as any)[RAW_TARGET]).toBeDefined();

        // extra is NOT tracked but is a plain object read through a proxy — must still be proxied
        expect((reactive.config.theme.extra as any)[RAW_TARGET]).toBeDefined();
    });
});

