export const chartConfig = {
  colors: {
    primary: 'hsl(217, 91%, 60%)',
    secondary: 'hsl(142, 69%, 58%)',
    warning: 'hsl(47, 96%, 53%)',
    danger: 'hsl(0, 84%, 60%)',
    info: 'hsl(270, 95%, 75%)',
    grid: 'hsl(216, 34%, 17%)',
    text: 'hsl(215, 20%, 65%)'
  },
  baseOptions: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      }
    }
  }
};
