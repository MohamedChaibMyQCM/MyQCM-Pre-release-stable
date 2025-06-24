function TrackPerformance() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();

      console.log(`${propertyKey} execution time: ${end - start}ms`);

      return result;
    };

    return descriptor;
  };
}
