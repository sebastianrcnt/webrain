var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Day1", "Day2", "Day3", "Day4"],
    datasets: [
      {
        fill: false,
        label: "day",
        data: [2, 5, 10, 5],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderColor: "#409EFF",
        borderWidth: 1,
      },
    ],
  },
  options: {
    legend: {
      display: false,
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem) => `${tooltipItem.yLabel}: ${tooltipItem.xLabel}`,
        title: () => null,
      },
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      xAxes: [
        {
          label: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
  },
});
