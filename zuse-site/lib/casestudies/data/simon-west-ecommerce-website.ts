import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "e-commerce",
  slug: "simon-west-ecommerce-website",
  title: "Fine Jewellery eCommerce Transformation: Simon West Jewellery",
  description: "Simon West Jewellery is a Melbourne-based fine jewellery brand specialising in handcrafted, bespoke pieces. With a legacy spanning over two decades, they are renowned for their exquisite craftsmanship, custom engagement rings, and wedding bands. Every piece is meticulously designed with precision, ensuring a timeless aesthetic that reflects each client’s unique style.",
  banner: `${CDN_URL}/simon_west_case_banner_3fc18331b4.jpg`,
  about: "Simon West Jewellery is a Melbourne-based fine jewellery brand specialising in handcrafted, bespoke pieces. With a legacy spanning over two decades, they are renowned for their exquisite craftsmanship, custom engagement rings, and wedding bands. Every piece is meticulously designed with precision, ensuring a timeless aesthetic that reflects each client’s unique style.",
  meta: [
    {
      label: "Client",
      value: "Simon West Fine Jewellery"
    },
    {
      label: "Industry",
      value: "Fine Jewellery Design and Retail"
    },
    {
      label: "Location",
      value: "Melbourne, Australia"
    },
    {
      label: "Company Size",
      value: "Small Business"
    },
    {
      label: "Website",
      href: "https://simonwestjewellery.com/",
      hrefLabel: "simonwestjewellery.com",
      value: "simonwestjewellery.com"
    },
    {
      label: "Notable Achievements",
      list: [
        "Established in 1999, with over two decades of experience in crafting bespoke jewellery.",
        "Specialises in handmade engagement rings and wedding bands, renowned for quality and durability."
      ]
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Objective & Challenge",
      paragraphs: [
        "Simon West Fine Jewellery sought a digital transformation, moving from an outdated website to a modern, SEO-optimised eCommerce site. The goal was to create a custom, mobile-responsive, high-performance Shopify store. Key challenges included:"
      ],
      bullets: [
        {
          title: "Outdated Website",
          body: "Poor functionality and limited online engagement."
        },
        {
          title: "Limited Online Presence",
          body: "Minimal SEO efforts and dependency on in-store sales."
        },
        {
          title: "Mobile Responsiveness Issues",
          body: "Lack of optimisation across devices."
        },
        {
          title: "Product Photography Optimisation",
          body: "Need for high-quality images across various screen sizes."
        },
        {
          title: "Scalability Constraints",
          body: "Existing platform lacked eCommerce capabilities."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-1.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-1.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "SEO-Optimised eCommerce Approach & Process",
      paragraphs: [
        "To address these challenges, Zuse Digital followed a structured design, development, and SEO optimisation process:"
      ],
      bullets: [
        {
          body: "Conducted a Discovery Workshop to align on goals and branding."
        },
        {
          body: "Performed competitor research to identify industry best practices."
        },
        {
          body: "Developed a mood board to define the visual direction."
        },
        {
          body: "Created wireframes and mockups in Figma, refining based on client feedback. Learn more about Website Design"
        },
        {
          body: "Designed a luxury-inspired, intuitive website with seamless navigation."
        },
        {
          body: "Built a fully responsive Shopify website optimised for mobile and desktop."
        },
        {
          body: "Integrated technical SEO enhancements, including metadata and structured content."
        },
        {
          body: "Compressed high-resolution product images for faster load times."
        },
        {
          body: "Improved site speed and Core Web Vitals for a seamless shopping experience."
        },
        {
          body: "Implemented alt text for all images to enhance SEO and accessibility."
        },
        {
          body: "Integrated secure payment gateways and inventory management. Learn more about Web Application Development"
        },
        {
          body: "Developed compelling product descriptions and brand storytelling."
        },
        {
          body: "Created landing pages for key collections and promotions."
        },
        {
          body: "Conducted cross-device, browser, and functionality testing."
        },
        {
          body: "Provided training and documentation for the client’s team."
        },
        {
          body: "Offered ongoing analytics tracking and site maintenance."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-2.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-2.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-3.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-3.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "text",
      title: "Solution & Outcome",
      paragraphs: [
        "The result was a fully optimised, high-performance Shopify website that:",
        "This transformation positioned Simon West Jewellery as a leading luxury jewellery website, enhancing customer engagement and driving online sales."
      ],
      bullets: [
        {
          body: "Strengthened Simon West Jewellery’s digital brand presence."
        },
        {
          body: "Provided a seamless shopping experience across all devices."
        },
        {
          body: "Increased search visibility and site performance through SEO best practices."
        },
        {
          body: "Improved conversion rates with an intuitive, luxury-focused UI."
        },
        {
          body: "Enabled scalability for future growth in the eCommerce market."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-4.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-4.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 834
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-5.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-5.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-6.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-6.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-7.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-7.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-8.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-8.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-9.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-9.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-10.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-10.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-11.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-11.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-12.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-12.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-13.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-13.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-14.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-14.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-15.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-15.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-16.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-16.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/simon-west-case-img-17.jpg`,
        webp: `${CDN_URL}/images/simon-west-case-img-17.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    }
  ],
  testimonial: {
    name: "Simon West",
    role: "Simon West Fine Jewellery",
    avatar: {
      src: `${CDN_URL}/images/simon-west.jpg`,
      webp: `${CDN_URL}/images/simon-west.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/simon-west-logo.png`,
      webp: `${CDN_URL}/images/simon-west-logo.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "We are so happy with our new website & all your hard work has paid off.",
    full: [
      "We can highly recommend Zanyar at Zuse Digital for building our beautiful website to help bring us into the ecommerce world. Zanyar came up with a plan after our initial meeting to target all our needs & suggested new ideas ones we hadn’t thought of including greater user experience which is why we chose Zuse Digital.",
      "Zanyar & his team where able to bring the website to life & getting changes made was never a problem. Zanyar went above & beyond when it counted.",
      "Thank you Zanyar & team for all your hard work. We really enjoyed working with you & really appreciate all your hard work. I can highly recommend Zanyar to anyone. We are so happy with our new website & all your hard work has paid off. Congratulations on doing a beautiful job & look forward to working with you on the next project."
    ],
    rating: 5
  },
  strapiSlug: "casestudy-simonwest"
};

export default study;
