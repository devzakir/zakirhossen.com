export const content = {
  meta: {
    title: 'জাকির হোসেন — ধীরে, সৎভাবে, ধৈর্য ধরে গড়ে তোলা',
    description:
      'গ্রাম থেকে, শূন্য থেকে গড়ে তোলা এক সোলো ফাউন্ডারের গল্প। JuggleHire ও Lomeyo LLC-এর নির্মাতা জাকির হোসেন।',
    url: 'https://devzakir.com',
    ogImage: '/og.png',
  },
  hero: {
    name: 'জাকির হোসেন',
    fightBn: 'গ্রাম থেকে, শূন্য থেকে — ধীরে, সৎভাবে, ধৈর্য ধরে গড়ে তুলছি।',
    bridgeEn: 'Bangladeshi solo founder building global SaaS — in the open.',
  },
  fights: [
    { bn: 'অল্প বয়সে বিয়ে করেছি — তবু স্বপ্ন ছাড়িনি।' },
    { bn: 'প্রতিদিন শিখি, সারাজীবন শিখব।' },
    { bn: 'চরিত্র গড়ে ধীরে, তাড়াহুড়ো করে নয়।' },
    { bn: 'শূন্য থেকে সম্পদ — কোনো ডিগ্রি নেই, কোনো ফান্ডিং নেই।' },
    { bn: 'সবকিছু খোলাখুলি — আসল সংখ্যা, আসল ব্যর্থতা।' },
  ],
  building: [
    {
      name: 'JuggleHire',
      descBn: 'ছোট দল ও স্টার্টআপের জন্য সহজ রিক্রুটমেন্ট CRM। আমার মূল পণ্য।',
      href: 'https://jugglehire.com',
    },
    {
      name: 'Lomeyo LLC',
      descBn: 'আমার সফটওয়্যার কোম্পানি — প্রতি মাসে নতুন পণ্য বানাই, খোলাখুলি।',
      href: 'https://lomeyo.com',
    },
  ],
  story: {
    bn: 'ময়মনসিংহের তারাকান্দা গ্রাম থেকে। SSC পাস, ডিপ্লোমা অসমাপ্ত — ১০+ বছর নিজে নিজে শেখা সফটওয়্যার ইঞ্জিনিয়ার। ২২ বছরে বিয়ে, দুই ছেলে, প্যারালাইজড বাবা। ৪.৫ লাখ টাকা দেনা থেকে ঘুরে দাঁড়িয়েছি। এখন Lomeyo LLC-এর সোলো ফাউন্ডার — লক্ষ্য ২০২৭ সালের মধ্যে মিলিয়নিয়ার।',
  },
  follow: [
    {
      label: 'LinkedIn',
      noteBn: 'ফাউন্ডার জার্নি, ইংরেজিতে — বিল্ড আপডেট ও সংখ্যা।',
      href: 'https://www.linkedin.com/in/devzakir',
    },
    {
      label: 'X (Twitter)',
      noteBn: 'প্রতিদিনের বিল্ড আপডেট, স্ক্রিনশট।',
      href: 'https://x.com/devzakir',
    },
    {
      label: 'YouTube',
      noteBn: 'বাংলা ভিডিও — সম্পদ, শেখা, উদ্যোক্তা জীবন।',
      href: 'https://youtube.com/@devzakir',
    },
    {
      label: 'TikTok',
      noteBn: 'ছোট ভিডিও — বিল্ডিং ইন পাবলিক।',
      href: 'https://tiktok.com/@devzakir',
    },
  ],
  footer: {
    email: 'zakir@lomeyo.com',
  },
} as const;

export type Content = typeof content;
