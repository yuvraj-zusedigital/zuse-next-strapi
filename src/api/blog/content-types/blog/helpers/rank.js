'use strict';

function shouldAutoAssignBlogRank(rank) {
  if (rank === undefined || rank === null) return true;
  if (rank === '') return true;
  const n = Number(rank);
  if (!Number.isFinite(n)) return true;
  return n === 0;
}

async function getNextBlogRank(strapi) {
  const rows = await strapi.db.query('api::blog.blog').findMany({
    select: ['rank'],
    where: { rank: { $notNull: true } },
    orderBy: { rank: 'desc' },
    limit: 1,
  });
  const top = rows[0]?.rank;
  const n = top == null ? 0 : Number(top);
  return (Number.isFinite(n) ? n : 0) + 1;
}

module.exports = {
  shouldAutoAssignBlogRank,
  getNextBlogRank,
};
