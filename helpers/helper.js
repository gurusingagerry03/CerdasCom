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

const toEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    let vid = u.searchParams.get('v') || '';
    if (!vid && u.hostname.includes('youtu.be')) {
      vid = u.pathname.slice(1);
    }
    return vid ? `https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1` : '';
  } catch (e) {
    return '';
  }
};

module.exports = { formatPrice, formatDate, getPercent, toEmbedUrl };
