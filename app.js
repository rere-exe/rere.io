// Fetch Demo API: Random Joke
async function fetchDemoApi() {
  const apiResult = document.getElementById("apiResult");
  apiResult.textContent = "Loading...";

  try {
    const res = await fetch("https://v2.jokeapi.dev/joke/Programming?type=single");
    const data = await res.json();
    apiResult.textContent = data.joke || "No joke found!";
  } catch (err) {
    apiResult.textContent = "Error fetching joke.";
    console.error(err);
  }
}

// async function runMlDemo() {
//   const mlStatus = document.getElementById("mlStatus");
//   const mlPrediction = document.getElementById("mlPrediction");

//   mlStatus.textContent = "Status: training...";
//   mlPrediction.textContent = "";

//   try {
//     const model = tf.sequential();
//     model.add(tf.layers.dense({ inputShape: [1], units: 1 }));
//     model.compile({ optimizer: tf.train.sgd(0.1), loss: "meanSquaredError" });

//     const xs = tf.tensor2d([0, 1, 2, 3, 4], [5, 1]);
//     const ys = tf.tensor2d([1, 3, 5, 7, 9], [5, 1]); // y = 2x+1

//     await model.fit(xs, ys, { epochs: 150 });

//     mlStatus.textContent = "Status: predicting...";
//     const pred = model.predict(tf.tensor2d([6], [1, 1]));
//     const predData = await pred.data();

//     mlStatus.textContent = "Status: done!";
//     mlPrediction.textContent = `Prediction for x=6: ${predData[0].toFixed(2)}`;

//     xs.dispose();
//     ys.dispose();
//     pred.dispose();
//   } catch (err) {
//     mlStatus.textContent = "Status: error";
//     console.error(err);
//   }
// }
// npm install -g http-server
// C:\Users\rerel\Downloads\codes\newerish\Portfolioweb
// http-server -p 8000