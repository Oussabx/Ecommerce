/**
 * EDITABLE PAGE CONTENT
 * ---------------------
 * Policy and information copy for the store. Text wrapped in [[double
 * brackets]] is a placeholder that OSA Techstore must confirm or replace —
 * it is highlighted on the page so it can't be mistaken for a final policy.
 *
 * Block types: p (paragraph), ul (list), h (sub-heading).
 */
export type Block = { p: string } | { ul: string[] } | { h: string };

export interface InfoPage {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  intro: string;
  updated?: string;
  sections: { heading: string; blocks: Block[] }[];
}

export const pages: Record<string, InfoPage> = {
  about: {
    slug: "about",
    index: "A/01",
    title: "About OSA",
    kicker: "Technology, curated",
    intro: "OSA Techstore is a technology retailer in Lebanon. We stock a focused range of devices and describe them plainly, so you can choose quickly and buy with confidence.",
    sections: [
      {
        heading: "What we believe",
        blocks: [
          { p: "Buying technology shouldn't feel like guesswork. Spec sheets are long, product names are confusing and most stores show you everything at once." },
          { p: "We do the opposite: a deliberately tight range, clear comparisons and honest information about price, availability and warranty." },
        ],
      },
      {
        heading: "How we work",
        blocks: [
          {
            ul: [
              "We list genuine products from established brands.",
              "Prices are shown in USD, with any price drop based on the real previous price.",
              "We confirm every order by phone before dispatch.",
              "We deliver across Lebanon.",
            ],
          },
        ],
      },
      {
        heading: "Our story",
        blocks: [{ p: "[[Add OSA Techstore's story: when it started, who runs it, and where you are based.]]" }],
      },
    ],
  },

  delivery: {
    slug: "delivery",
    index: "H/01",
    title: "Delivery",
    kicker: "Help — Delivery information",
    intro: "We deliver to every governorate in Lebanon. Here is how delivery works when you order from OSA Techstore.",
    updated: "[[Date]]",
    sections: [
      {
        heading: "Where we deliver",
        blocks: [{ p: "Beirut, Mount Lebanon, North, Akkar, Bekaa, Baalbek-Hermel, South and Nabatieh." }],
      },
      {
        heading: "Fees and timing",
        blocks: [
          { p: "After you place an order, our team calls you to confirm stock, the delivery fee for your area and a delivery window." },
          { p: "[[Add delivery fees by area and typical delivery times once confirmed.]]" },
        ],
      },
      {
        heading: "On delivery",
        blocks: [
          {
            ul: [
              "Please have the amount ready in USD for cash on delivery.",
              "Check the package is sealed and undamaged before accepting it.",
              "[[Add ID or signature requirements, if any.]]",
            ],
          },
        ],
      },
    ],
  },

  returns: {
    slug: "returns",
    index: "H/02",
    title: "Returns & exchanges",
    kicker: "Help — Returns",
    intro: "If something isn't right with your order, contact us and we'll explain your options.",
    updated: "[[Date]]",
    sections: [
      {
        heading: "Our policy",
        blocks: [
          { p: "[[Set out the return / exchange window (for example, a number of days from delivery) and conditions — sealed vs opened products, original packaging, proof of purchase.]]" },
        ],
      },
      {
        heading: "Faulty or damaged items",
        blocks: [{ p: "If a product arrives damaged or develops a fault, contact us with your order reference and a short description. [[Describe how faulty items are inspected, repaired or replaced.]]" }],
      },
      {
        heading: "How to start a return",
        blocks: [{ ul: ["Contact us through the contact page with your order reference.", "We'll confirm whether the item is eligible and arrange next steps.", "[[Add who pays return delivery and how refunds are issued.]]"] }],
      },
    ],
  },

  warranty: {
    slug: "warranty",
    index: "H/03",
    title: "Warranty",
    kicker: "Help — Warranty information",
    intro: "Each product page shows the warranty that applies to it. This page explains how to use it.",
    updated: "[[Date]]",
    sections: [
      {
        heading: "What's covered",
        blocks: [
          { p: "Warranty covers manufacturing defects under normal use. It does not usually cover accidental damage, liquid damage or unauthorised repairs." },
          { p: "[[Confirm warranty provider(s) — manufacturer, official distributor or OSA Techstore — and duration per brand or category.]]" },
        ],
      },
      {
        heading: "Making a claim",
        blocks: [
          {
            ul: [
              "Keep your order reference — it's your proof of purchase.",
              "Contact us describing the issue; photos or a short video help.",
              "We'll guide you through the manufacturer or distributor process.",
            ],
          },
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    index: "L/01",
    title: "Privacy policy",
    kicker: "Legal",
    intro: "This policy explains what personal information OSA Techstore collects, why, and how it is protected.",
    updated: "[[Date]]",
    sections: [
      {
        heading: "What we collect",
        blocks: [
          {
            ul: [
              "Order details: your name, email, phone number and delivery address.",
              "Account details if you create one: name, email, phone and saved addresses. Passwords are stored as one-way hashes.",
              "Newsletter: your email address, if you subscribe.",
              "Messages you send through the contact form.",
            ],
          },
          { p: "Your cart, wishlist, recently viewed products and recent searches are stored in your own browser (local storage) and are not sent to us until you place an order." },
        ],
      },
      {
        heading: "How we use it",
        blocks: [{ p: "To process and deliver orders, to contact you about your order, to provide account features and — only if you subscribe — to send our newsletter. We do not sell your personal information." }],
      },
      {
        heading: "Cookies",
        blocks: [{ p: "We use a single essential cookie to keep you signed in. [[List any analytics or marketing tools before enabling them.]]" }],
      },
      {
        heading: "Your rights",
        blocks: [{ p: "You can ask us to access, correct or delete your personal information, or unsubscribe from the newsletter at any time. [[Add contact address for privacy requests.]]" }],
      },
    ],
  },

  terms: {
    slug: "terms",
    index: "L/02",
    title: "Terms & conditions",
    kicker: "Legal",
    intro: "These terms apply when you browse and order from OSA Techstore.",
    updated: "[[Date]]",
    sections: [
      {
        heading: "Orders",
        blocks: [
          { p: "Placing an order sends an order request. A contract is formed only when we confirm your order by phone. We may decline an order, for example if a product is out of stock or a price was displayed in error." },
        ],
      },
      {
        heading: "Prices and payment",
        blocks: [{ p: "Prices are in US dollars. Delivery fees are confirmed when we confirm your order. Payment is made by the method shown at checkout." }],
      },
      {
        heading: "Delivery, returns and warranty",
        blocks: [{ p: "See our Delivery, Returns & exchanges and Warranty pages, which form part of these terms." }],
      },
      {
        heading: "Business details",
        blocks: [{ p: "[[Add registered business name, commercial registration number and address.]]" }],
      },
    ],
  },
};

export const faqs: { q: string; a: string }[] = [
  { q: "How do I place an order?", a: "Add products to your cart and go to checkout. Enter your contact and delivery details and place the order. Our team then calls you to confirm stock, the delivery fee and timing before anything is dispatched." },
  { q: "Do I need an account?", a: "No. You can check out as a guest. An account lets you see order history and save delivery addresses." },
  { q: "How can I pay?", a: "We currently accept cash on delivery in USD. Online card payment isn't available yet." },
  { q: "Where do you deliver?", a: "Anywhere in Lebanon — all eight governorates. The delivery fee and timing are confirmed by phone when we confirm your order." },
  { q: "Are your products genuine?", a: "Yes. We sell genuine products from established brands. Warranty details are shown on each product page." },
  { q: "What if my product has a problem?", a: "Contact us with your order reference. See the Warranty and Returns pages for how claims and returns work." },
  { q: "Is the stock shown live?", a: "Stock levels are maintained by our team. We always confirm availability by phone before dispatch, so you will never be charged for something we can't deliver." },
];
