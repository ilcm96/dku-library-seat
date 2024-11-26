// 초기 날짜 설정
document.addEventListener("DOMContentLoaded", async () => {
  const today = new Date();

  document.getElementById("start-date").valueAsDate = today;
  document.getElementById("end-date").valueAsDate = today;

  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  const data = await fetchData(startDate, endDate);
  renderChart(data);
});

// 버튼 클릭
document.getElementById("calculate-btn").addEventListener("click", async () => {
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  const diff = new Date(endDate) - new Date(startDate);
  if (diff < 0) {
    alert("시작 날짜가 종료 날짜보다 늦을 수 없습니다.");
    return;
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (diff > 13 * oneDayMs) {
    alert("기간은 14일 이내로 설정해주세요.");
    return;
  }

  const chartContainer = document.querySelector(".chart-container");
  chartContainer.innerHTML = "차트 로딩 중...";
  chartContainer.removeAttribute("_echarts_instance_");

  const data = await fetchData(startDate, endDate);
  renderChart(data);
});

// 오늘
document.getElementById("pre-rltm").addEventListener("click", async () => {
  document.getElementById("start-date").valueAsDate = new Date();
  document.getElementById("end-date").valueAsDate = new Date();

  document.getElementById("calculate-btn").click();
});

// 지난 1주일
document.getElementById("pre-week").addEventListener("click", async () => {
  const today = new Date();
  const weekAgo = new Date(today - 6 * 24 * 60 * 60 * 1000);

  document.getElementById("start-date").valueAsDate = weekAgo;
  document.getElementById("end-date").valueAsDate = today;

  document.getElementById("calculate-btn").click();
});

// 24-1학기 기말고사
document.getElementById("pre-1").addEventListener("click", async () => {
  document.getElementById("start-date").valueAsDate = new Date("2024-06-11");
  document.getElementById("end-date").valueAsDate = new Date("2024-06-20");

  document.getElementById("calculate-btn").click();
});

//24-2학기 중간고사
document.getElementById("pre-2").addEventListener("click", async () => {
  document.getElementById("start-date").valueAsDate = new Date("2024-10-21");
  document.getElementById("end-date").valueAsDate = new Date("2024-10-31");

  document.getElementById("calculate-btn").click();
});

async function fetchData(startDate, endDate) {
  const response = await fetch(`/api/v2?start=${startDate}&end=${endDate}`);
  return response.json();
}

function renderChart(data) {
  const chartContainer = document.querySelector(".chart-container");
  const myChart = echarts.init(chartContainer);

  const option = {
    animation: false,
    tooltip: {
      trigger: "axis",
      // 높은 사용률 순으로 정렬
      formatter: function (params) {
        // params는 배열로, 각 시리즈의 데이터를 포함합니다.
        // 값을 기준으로 내림차순 정렬합니다.
        params.sort(function (a, b) {
          return b.value - a.value;
        });

        // 정렬된 데이터를 사용하여 툴팁 내용을 생성합니다.
        let tooltipContent = params[0].name + "<br/>";
        params.forEach(function (item) {
          tooltipContent += item.marker + item.seriesName + ": " + item.value + "<br/>";
        });

        return tooltipContent;
      },
    },
    legend: {
      data: [
        "1층 1열람실",
        "1층 6열람실",
        "2층 2열람실",
        "2층 3열람실",
        "2층 4열람실",
        "2층 대학원열람실",
        "법학 열람실",
      ],
    },
    grid: {
      left: "1%",
      right: "1%",
      bottom: "0%",
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [
        "00:00",
        "00:15",
        "00:30",
        "00:45",
        "01:00",
        "01:15",
        "01:30",
        "01:45",
        "02:00",
        "02:15",
        "02:30",
        "02:45",
        "03:00",
        "03:15",
        "03:30",
        "03:45",
        "04:00",
        "04:15",
        "04:30",
        "04:45",
        "05:00",
        "05:15",
        "05:30",
        "05:45",
        "06:00",
        "06:15",
        "06:30",
        "06:45",
        "07:00",
        "07:15",
        "07:30",
        "07:45",
        "08:00",
        "08:15",
        "08:30",
        "08:45",
        "09:00",
        "09:15",
        "09:30",
        "09:45",
        "10:00",
        "10:15",
        "10:30",
        "10:45",
        "11:00",
        "11:15",
        "11:30",
        "11:45",
        "12:00",
        "12:15",
        "12:30",
        "12:45",
        "13:00",
        "13:15",
        "13:30",
        "13:45",
        "14:00",
        "14:15",
        "14:30",
        "14:45",
        "15:00",
        "15:15",
        "15:30",
        "15:45",
        "16:00",
        "16:15",
        "16:30",
        "16:45",
        "17:00",
        "17:15",
        "17:30",
        "17:45",
        "18:00",
        "18:15",
        "18:30",
        "18:45",
        "19:00",
        "19:15",
        "19:30",
        "19:45",
        "20:00",
        "20:15",
        "20:30",
        "20:45",
        "21:00",
        "21:15",
        "21:30",
        "21:45",
        "22:00",
        "22:15",
        "22:30",
        "22:45",
        "23:00",
        "23:15",
        "23:30",
        "23:45",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "1층 1열람실",
        type: "line",
        showSymbol: false,
        data: data["1층 1열람실"],
      },
      {
        name: "1층 6열람실",
        type: "line",
        showSymbol: false,
        data: data["1층 6열람실"],
      },
      {
        name: "2층 2열람실",
        type: "line",
        showSymbol: false,
        data: data["2층 2열람실"],
      },
      {
        name: "2층 3열람실",
        type: "line",
        showSymbol: false,
        data: data["2층 3열람실"],
      },
      {
        name: "2층 4열람실",
        type: "line",
        showSymbol: false,
        data: data["2층 4열람실"],
      },
      {
        name: "2층 대학원열람실",
        type: "line",
        showSymbol: false,
        data: data["2층 대학원열람실"],
      },
      {
        name: "법학 열람실",
        type: "line",
        showSymbol: false,
        data: data["법학 열람실"],
      },
    ],
  };

  myChart.setOption(option);
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}
