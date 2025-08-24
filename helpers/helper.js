const formatPrice = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(val);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getPercent = (num) => {
  num = num * 100;
  return num.toFixed(1);
};

module.exports = { formatPrice, formatDate, getPercent };
