/*  HOME BANNERS — edit this file to change the 3 banner posts.
    ---------------------------------------------------------------
    To add a promotional post: put the image in  assets/banners/
    and set  image: "assets/banners/your-post.jpg"
    Any size works (square, 4:5, story, wide) — it is fitted inside the
    banner frame with a soft blurred backdrop, so it always looks clean.
    Set  full: true  to make the image fill the whole banner instead.
    Leave image empty ("") to show the built-in graphic.
    Add or remove objects to change the number of banners.            */
window.SGW_BANNERS = [
  {
    tag: "Prominance profile warranty",
    title: "20 years of<br><em>peace of mind.</em>",
    text: "Every SGW window is built on genuine Prominance uPVC profiles, backed by a 20-year profile warranty.",
    cta: { label: "See warranty details", href: "products.html#warranty" },
    image: "",          // e.g. "assets/banners/warranty-post.jpg"
    graphic: "seal",    // built-in graphic when no image: seal | sliding | casement | french | bifold | door | tilt
  },
  {
    tag: "Free for Hyderabad homes",
    title: "Free site visit<br><em>& measurement.</em>",
    text: "Our team measures every opening, recommends the right system and gives you a clear, itemised quote.",
    cta: { label: "Book a free visit", href: "contact.html#quote" },
    image: "",
    graphic: "sliding",
  },
  {
    tag: "New · Interactive",
    title: "Design your window<br><em>online.</em>",
    text: "Pick a system, size, finish and glass. See it drawn to scale and send the spec to us on WhatsApp.",
    cta: { label: "Open the designer", href: "products.html#configurator" },
    image: "",
    graphic: "bifold",
  },
];
