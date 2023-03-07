async function runWorkers(tasks, num) {
  const workers = [];
  for (let i = 0; i < num; i++) {
    const worker = async () => {
      let task = getNextTask(tasks);
      while (task) {
        await task();
        task = getNextTask(tasks);
      }
      return;
    };

    const workerPromise = new Promise((resolve) => {
      return worker().finally(() => resolve(true));
    });

    workers.push(workerPromise);
  }

  await Promise.all(workers);
  return;
}

function getNextTask(tasks) {
  return tasks.pop();
}

module.exports = {
  runWorkers,
};
