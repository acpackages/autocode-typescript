import { AcReactivity } from "../src/ac-reactivity";
import { performance } from "perf_hooks";

// Recursive full-proxy wrapper for comparative baseline
function createRecursiveFullProxy(target: any): any {
    if (!target || typeof target !== "object") {
        return target;
    }
    const handler: ProxyHandler<any> = {
        get(t, key, receiver) {
            const val = Reflect.get(t, key, receiver);
            if (val && typeof val === "object") {
                return new Proxy(val, handler);
            }
            return val;
        },
        set(t, key, value, receiver) {
            return Reflect.set(t, key, value, receiver);
        }
    };
    return new Proxy(target, handler);
}

function runBenchmark() {
    const ITERATIONS = 1000000; // 1M iterations
    console.log("====================================================");
    console.log(`Running ac-reactivity Performance Benchmarks (${ITERATIONS.toLocaleString()} iterations)`);
    console.log("====================================================");

    // ----------------------------------------------------
    // Benchmark 1: Reads
    // ----------------------------------------------------
    {
        const plain = { count: 10 };
        
        const fullProxy = createRecursiveFullProxy({ count: 10 });
        
        const reactive = AcReactivity.makeReactive({
            instance: { count: 10 },
            properties: ["count"],
            onChange: () => {}
        });

        // Warm up JIT
        for (let i = 0; i < 10000; i++) {
            const a = plain.count;
            const b = fullProxy.count;
            const c = reactive.count;
        }

        let start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            const val = plain.count;
        }
        const plainTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            const val = fullProxy.count;
        }
        const fullProxyTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            const val = reactive.count;
        }
        const reactiveTime = performance.now() - start;

        console.log("\n[1] Property Reads (count: 10):");
        console.log(`- Plain Object:    ${plainTime.toFixed(2)} ms (100%)`);
        console.log(`- Full Proxy:      ${fullProxyTime.toFixed(2)} ms (${(fullProxyTime / plainTime * 100).toFixed(0)}% slower)`);
        console.log(`- ac-reactivity:   ${reactiveTime.toFixed(2)} ms (${(reactiveTime / plainTime * 100).toFixed(0)}% slower)`);
    }

    // ----------------------------------------------------
    // Benchmark 2: Writes
    // ----------------------------------------------------
    {
        const plain = { count: 10 };
        const fullProxy = createRecursiveFullProxy({ count: 10 });
        const reactive = AcReactivity.makeReactive({
            instance: { count: 10 },
            properties: ["count"],
            onChange: () => {}
        });

        // Warm up JIT
        for (let i = 0; i < 10000; i++) {
            plain.count = i;
            fullProxy.count = i;
            reactive.count = i;
        }

        let start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            plain.count = i;
        }
        const plainTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            fullProxy.count = i;
        }
        const fullProxyTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            reactive.count = i;
        }
        const reactiveTime = performance.now() - start;

        console.log("\n[2] Property Writes (count = i):");
        console.log(`- Plain Object:    ${plainTime.toFixed(2)} ms (100%)`);
        console.log(`- Full Proxy:      ${fullProxyTime.toFixed(2)} ms (${(fullProxyTime / plainTime * 100).toFixed(0)}% slower)`);
        console.log(`- ac-reactivity:   ${reactiveTime.toFixed(2)} ms (${(reactiveTime / plainTime * 100).toFixed(0)}% slower)`);
    }

    // ----------------------------------------------------
    // Benchmark 3: Nested Updates
    // ----------------------------------------------------
    {
        const makeNested = () => ({
            user: {
                address: {
                    city: "Boston"
                }
            }
        });

        const plain = makeNested();
        const fullProxy = createRecursiveFullProxy(makeNested());
        const reactive = AcReactivity.makeReactive({
            instance: makeNested(),
            properties: ["user.address.city"],
            onChange: () => {}
        });

        let start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            plain.user.address.city = "New York";
        }
        const plainTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            fullProxy.user.address.city = "New York";
        }
        const fullProxyTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            reactive.user.address.city = "New York";
        }
        const reactiveTime = performance.now() - start;

        console.log("\n[3] Deep Nested Updates (user.address.city = 'New York'):");
        console.log(`- Plain Object:    ${plainTime.toFixed(2)} ms (100%)`);
        console.log(`- Full Proxy:      ${fullProxyTime.toFixed(2)} ms (${(fullProxyTime / plainTime * 100).toFixed(0)}% slower)`);
        console.log(`- ac-reactivity:   ${reactiveTime.toFixed(2)} ms (${(reactiveTime / plainTime * 100).toFixed(0)}% slower)`);
    }

    // ----------------------------------------------------
    // Benchmark 4: Array Mutations
    // ----------------------------------------------------
    {
        const ARRAY_ITERATIONS = 10000;
        const plain: any[] = [];
        const fullProxy = createRecursiveFullProxy([]);
        const reactive = AcReactivity.makeReactive({
            instance: { items: [] as any[] },
            properties: ["items"],
            onChange: () => {}
        });

        let start = performance.now();
        for (let i = 0; i < ARRAY_ITERATIONS; i++) {
            plain.push(i);
        }
        const plainTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ARRAY_ITERATIONS; i++) {
            fullProxy.push(i);
        }
        const fullProxyTime = performance.now() - start;

        start = performance.now();
        for (let i = 0; i < ARRAY_ITERATIONS; i++) {
            reactive.items.push(i);
        }
        const reactiveTime = performance.now() - start;

        console.log(`\n[4] Array Mutations (${ARRAY_ITERATIONS.toLocaleString()} pushes):`);
        console.log(`- Plain Array:     ${plainTime.toFixed(2)} ms (100%)`);
        console.log(`- Full Proxy:      ${fullProxyTime.toFixed(2)} ms (${(fullProxyTime / plainTime * 100).toFixed(0)}% slower)`);
        console.log(`- ac-reactivity:   ${reactiveTime.toFixed(2)} ms (${(reactiveTime / plainTime * 100).toFixed(0)}% slower)`);
    }

    console.log("\n====================================================");
}

runBenchmark();
