export default function measureTimeElapsed(callback: () => void): number {
    const startTime = performance.now();

    // Call the provided function
    callback();

    // Calculate the elapsed time
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    console.log("Function took: " + (elapsedTime / 1000) + " seconds")

    return elapsedTime;
}
