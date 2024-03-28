class DataLoader {
  callbacks: any[] = [];
  keys: string[] = [];

  async dispatch() {
    await new Promise((resolve) => {
      process.nextTick(resolve);
    });

    if (this.keys.length > 0) {
      const keys = [...this.keys];
      console.log(`fetching data for key: ${keys.join(", ")}`);
      this.keys = [];
      let keyIndex = 0;
      for (const callback of this.callbacks) {
        callback(keys[keyIndex++]);
      }
      this.callbacks = [];
    }
  }

  async load(key: string) {
    this.keys.push(key);
    const promise = new Promise((resolve) => {
      this.callbacks.push(resolve);
    });

    return promise;
  }
}

const dataLoader = new DataLoader();

async function main() {
  for (let i = 0; i < 20; i++) {
    dataLoader.load(`key${i}`).then(console.log);
  }
  dataLoader.dispatch();

  await new Promise((resolve) => setTimeout(resolve, 500));

  for (let i = 20; i < 40; i++) {
    dataLoader.load(`key${i}`).then(console.log);
  }
  dataLoader.dispatch();
}

main();
