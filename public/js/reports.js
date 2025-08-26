document.addEventListener('DOMContentLoaded', () => {
  const { revLabels, revValues, topLabels, topValues } = window.chartData;

  new Chart(document.getElementById('revenueChart'), {
    type: 'bar',
    data: {
      labels: revLabels,
      datasets: [
        {
          label: 'Revenue (Rp)',
          data: revValues,
          backgroundColor: '#3b82f6',
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  new Chart(document.getElementById('topCoursesChart'), {
    type: 'bar',
    data: {
      labels: topLabels,
      datasets: [
        {
          label: 'Students',
          data: topValues,
          backgroundColor: '#16a34a',
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
});
