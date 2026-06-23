const paginate = (query, { page = 1, limit = 20, sort = '-createdAt' }) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, sort, page: pageNum };
};

const paginateResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

const buildFilter = (query, allowedFields) => {
  const filter = {};
  allowedFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      if (typeof query[field] === 'string' && query[field].startsWith('/')) {
        filter[field] = new RegExp(query[field].slice(1, -1), 'i');
      } else {
        filter[field] = query[field];
      }
    }
  });
  return filter;
};

const buildDateRangeFilter = (query, field) => {
  const filter = {};
  if (query.dateDebut || query.dateFin) {
    filter[field] = {};
    if (query.dateDebut) filter[field].$gte = new Date(query.dateDebut);
    if (query.dateFin) filter[field].$lte = new Date(query.dateFin);
  }
  return filter;
};

module.exports = { paginate, paginateResponse, buildFilter, buildDateRangeFilter };
