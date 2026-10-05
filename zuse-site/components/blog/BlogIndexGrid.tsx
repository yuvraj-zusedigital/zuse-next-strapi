"use client";

import { useState } from "react";
import BlogCard from "./BlogCard";

export type BlogIndexCard = {
  title: string;
  href: string;
  image: string;
};

type BlogIndexGridProps = {
  cards: BlogIndexCard[];
};

const CARDS_PER_PAGE = 6;

export default function BlogIndexGrid({ cards }: BlogIndexGridProps) {
  const [activePage, setActivePage] = useState(0);
  const pageCount = Math.ceil(cards.length / CARDS_PER_PAGE);
  const visibleCards = cards.slice(
    activePage * CARDS_PER_PAGE,
    (activePage + 1) * CARDS_PER_PAGE
  );

  return (
    <div className="zuse-blog-index-grid">
      {visibleCards.map((card, index) => (
        <BlogCard
          key={`${card.href}-${activePage}-${index}`}
          title={card.title}
          href={card.href}
          image={card.image}
        />
      ))}

      {pageCount > 1 ? (
        <nav className="zuse-blog-index-pagination" aria-label="Blog pagination">
          <button
            type="button"
            className="zuse-blog-index-pagination-nav"
            disabled={activePage === 0}
            onClick={() => setActivePage((page) => Math.max(0, page - 1))}
          >
            Prev
          </button>
          {Array.from({ length: pageCount }, (_, page) => (
            <button
              key={page}
              type="button"
              className={`zuse-blog-index-pagination-page${page === activePage ? " is-active" : ""}`}
              aria-label={`Show blog page ${page + 1}`}
              aria-current={page === activePage ? "page" : undefined}
              onClick={() => setActivePage(page)}
            >
              {page + 1}
            </button>
          ))}
          <button
            type="button"
            className="zuse-blog-index-pagination-nav"
            disabled={activePage === pageCount - 1}
            onClick={() =>
              setActivePage((page) => Math.min(pageCount - 1, page + 1))
            }
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
