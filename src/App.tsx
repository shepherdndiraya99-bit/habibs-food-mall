import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowDownRight, ArrowRight, Check, Clock3, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, Sparkles, Truck, X, Youtube } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  image: string;
  tag?: string;
};

type CartItem = MenuItem & { quantity: number };

const menuItems: MenuItem[] = [
  { id: 'texan-bbq', name: 'Texan BBQ', description: 'Smoky pulled beef, red onion, sweet BBQ glaze.', price: 12.5, brand: "Pappa's Pizza", image: '/pappas-pizza.png', tag: 'Best seller' },
  { id: 'pappas-special', name: "Papa's Special", description: 'Pepperoni, sausage, mushroom, green pepper, extra cheese.', price: 14, brand: "Pappa's Pizza", image: '/pappas-pizza.png', tag: 'Crowd favourite' },
  { id: 'custom-topping', name: 'Build Your Own', description: 'One base, five toppings, unlimited opinions.', price: 13, brand: "Pappa's Pizza", image: '/pappas-pizza.png' },
  { id: 'strawberry-shake', name: 'Strawberry Cloud', description: 'Cold strawberry cream, vanilla whip, berry drizzle.', price: 6.5, brand: 'Ice Cream Shake', image: '/ice-cream-shake.png', tag: 'New' },
  { id: 'salted-caramel', name: 'Salted Caramel', description: 'House caramel, soft serve, a pinch of sea salt.', price: 6.5, brand: 'Ice Cream Shake', image: '/ice-cream-shake.png' },
  { id: 'choc-crunch', name: 'Choc Crunch', description: 'Chocolate malt, cookie crumble, thick and cold.', price: 7, brand: 'Ice Cream Shake', image: '/ice-cream-shake.png' },
  { id: 'roosters-bucket', name: "Rooster's Bucket", description: 'Six pieces, seasoned fries, slaw and two sauces.', price: 16.5, brand: "Rooster's", image: '/roosters-chicken.png', tag: 'Feeds 2' },
  { id: 'hot-chicken', name: 'Hot Bird Box', description: 'Three crunchy pieces, fiery glaze, golden fries.', price: 10.5, brand: "Rooster's", image: '/roosters-chicken.png', tag: 'Spicy' },
  { id: 'wings-fries', name: 'Wings & Fries', description: 'Eight sticky wings with our signature seasoning.', price: 11, brand: "Rooster's", image: '/roosters-chicken.png' },
];

const galleryItems = [
  { src: '/hero-food-hall.png', alt: 'A table of pizza, fried chicken and a milkshake inside the food hall.', title: 'One roof. Three cravings.' },
  { src: '/pappas-pizza.png', alt: 'Freshly baked pizza with a blistered crust and melted cheese.', title: "Pappa's, straight from the oven." },
  { src: '/ice-cream-shake.png', alt: 'Strawberry milkshake with whipped cream on a mint counter.', title: 'Something cold for the walk home.' },
  { src: '/roosters-chicken.png', alt: 'Golden fried chicken pieces and seasoned fries in a basket.', title: "Rooster's brings the crunch." },
  { src: '/flyer-pappas-pizza.png', alt: "Pappa's Pizza menu flyer showing pizzas, drinks and prices.", title: "Pappa's Pizza menu." },
  { src: '/flyer-ice-cream-shake.png', alt: 'Ice Cream Shake chocolate ice cream shake promotional flyer.', title: 'Beat the heat with a chocolate shake.' },
  { src: '/flyer-roosters.png', alt: "Roosters fried chicken and fries promotional flyer.", title: "Rooster's chicken and fries." },
];

const navLinks = [
  ['Home', '#home'],
  ['Menu', '#menu'],
  ['Order Now', '#order'],
  ['Gallery', '#gallery'],
  ['About Us', '#about'],
  ['Contact', '#contact'],
];

function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-2.5" data-testid="link-logo">
      <span className={`grid h-10 w-10 place-items-center rounded-full border-2 ${inverse ? 'border-[#f5e8d0] text-[#f5e8d0]' : 'border-[#a92f22] text-[#a92f22]'}`}>
        <span className="font-display text-xl leading-none">H</span>
      </span>
      <span className={`font-display text-base font-bold leading-[.85] tracking-[-.04em] ${inverse ? 'text-[#f5e8d0]' : 'text-[#281a12]'}`}>
        HABIB'S
        <small className={`block font-mono text-[.52rem] font-medium tracking-[.2em] ${inverse ? 'text-[#e5bc4f]' : 'text-[#a92f22]'}`}>FOOD MALL</small>
      </span>
    </a>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [lightbox, setLightbox] = useState<(typeof galleryItems)[number] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.quantity * item.price, 0), [cart]);

  useEffect(() => {
    document.title = "Habib's Food Mall | Taste the Mall Experience";
    const description = document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', "Three cravings, one lively Zimbabwean food hall. Order Pappa's Pizza, Ice Cream Shake and Rooster's for pickup or delivery.");
    document.head.appendChild(description);
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: "Habib's Food Mall",
      servesCuisine: ['Pizza', 'Chicken', 'Dessert'],
      telephone: '+263 77 240 1184',
      address: { '@type': 'PostalAddress', addressLocality: 'Harare', addressCountry: 'ZW' },
    });
    document.head.appendChild(ld);
    return () => ld.remove();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
        setCartOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const found = current.find((cartItem) => cartItem.id === item.id);
      if (found) return current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      return [...current, { ...item, quantity: 1 }];
    });
    showToast(`${item.name} added to your order`);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      const quantity = item.quantity + change;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactSent(true);
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <div className="grain min-h-[100dvh] overflow-x-hidden">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#f5e8d0]/15 bg-[#261912]/95 text-[#f5e8d0] backdrop-blur-md">
        <div className="container-shell flex h-[74px] items-center justify-between">
          <Logo inverse />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} className="font-mono text-[.65rem] uppercase tracking-[.08em] text-[#dbcdb8] transition-colors hover:text-[#e8b94f]" data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setCartOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-full border border-[#f5e8d0]/30 transition-colors hover:border-[#e8b94f] hover:text-[#e8b94f]" aria-label={`Open cart with ${cartCount} items`} data-testid="button-open-cart">
              <ShoppingBag size={17} />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#d6452f] px-1 font-mono text-[.62rem] text-white" data-testid="status-cart-count">{cartCount}</span>}
            </button>
            <button onClick={() => scrollToId('order')} className="hidden rounded-full bg-[#e8b94f] px-5 py-2.5 font-mono text-[.65rem] font-medium uppercase tracking-[.1em] text-[#261912] transition-transform hover:-translate-y-0.5 sm:block" data-testid="button-header-order">Order now</button>
            <button onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full border border-[#f5e8d0]/30 lg:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
              {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-[#f5e8d0]/15 bg-[#261912] px-6 py-5 lg:hidden" aria-label="Mobile navigation">
            <div className="container-shell flex flex-col gap-1">
              {navLinks.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)} className="border-b border-[#f5e8d0]/10 py-3 font-mono text-xs uppercase tracking-[.12em] text-[#dbcdb8]" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main>
        <section id="home" className="relative flex min-h-[740px] items-end overflow-hidden bg-[#261912] pt-[74px] text-[#f5e8d0]">
          <img src="/hero-food-hall.png" alt="Pizza, fried chicken and a milkshake arranged on a lively food hall counter." className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(38,25,18,.98)_0%,rgba(38,25,18,.78)_38%,rgba(38,25,18,.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(38,25,18,.9)_0%,transparent_50%)]" />
          <div className="container-shell relative z-10 grid w-full items-end gap-12 pb-16 pt-28 md:grid-cols-[1.1fr_.9fr] md:pb-24">
            <div className="max-w-2xl">
              <div className="reveal mb-6 flex items-center gap-3 text-[#e8b94f]">
                <span className="h-px w-10 bg-current" />
                <span className="section-kicker">Harare's happy place for hungry people</span>
              </div>
              <h1 className="reveal reveal-delay-1 font-display text-[clamp(3.5rem,8vw,7.5rem)] font-bold leading-[.86] tracking-[-.065em] text-[#f5e8d0]">Taste the<br /><span className="text-[#e8b94f]">Mall Experience.</span></h1>
              <p className="reveal reveal-delay-2 mt-7 max-w-md text-base leading-7 text-[#dbcdb8] md:text-lg">Three food counters. One very good reason to stay a little longer. Bring the crew, follow the smell, leave with the best kind of full.</p>
              <div className="reveal reveal-delay-3 mt-9 flex flex-wrap gap-3">
                <button onClick={() => scrollToId('menu')} className="group flex items-center gap-3 rounded-full bg-[#d6452f] px-6 py-3.5 font-mono text-xs uppercase tracking-[.1em] text-[#fff4e6] transition-transform hover:-translate-y-1" data-testid="button-explore-menu">Explore the menu <ArrowDownRight size={16} className="transition-transform group-hover:rotate-[-45deg]" /></button>
                <button onClick={() => scrollToId('order')} className="rounded-full border border-[#f5e8d0]/45 px-6 py-3.5 font-mono text-xs uppercase tracking-[.1em] text-[#f5e8d0] transition-colors hover:border-[#e8b94f] hover:text-[#e8b94f]" data-testid="button-hero-order">Order now</button>
              </div>
            </div>
            <div className="hidden justify-self-end md:block">
              <div className="reveal reveal-delay-3 w-60 rotate-3 border border-[#f5e8d0]/35 bg-[#261912]/70 p-5 backdrop-blur-sm">
                <div className="mb-12 flex items-center justify-between"><span className="font-mono text-[.58rem] uppercase tracking-[.18em] text-[#dbcdb8]">Tonight's forecast</span><Sparkles size={17} className="text-[#e8b94f]" /></div>
                <p className="font-display text-4xl leading-none">Very<br /><span className="text-[#e8b94f]">tasty.</span></p>
                <div className="mt-8 flex items-end justify-between border-t border-[#f5e8d0]/20 pt-3"><span className="font-mono text-[.58rem] uppercase text-[#dbcdb8]">Doors open</span><span className="font-mono text-xs text-[#e8b94f]">10:00 — 22:00</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-b border-[#3b2920]/15 bg-[#e8b94f] py-3 text-[#261912]">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
            {[...Array(2)].flatMap((_, index) => ['PIZZA WITH A POINT OF VIEW', 'COLD SHAKES • BIG CRAVINGS', 'CRUNCH WORTH TALKING ABOUT', 'WELCOME TO THE MALL'].map((text) => <span key={`${index}-${text}`} className="flex items-center gap-8 font-mono text-[.68rem] font-medium tracking-[.14em]"><span className="text-[#d6452f]">•</span>{text}</span>))}
          </div>
        </div>

        <section id="menu" className="scroll-mt-20 bg-[#f3ead9] py-20 md:py-28">
          <div className="container-shell">
            <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="section-kicker text-[#a92f22]">Pick your lane</p>
                <h2 className="mt-4 max-w-xl font-display text-5xl font-bold leading-[.92] tracking-[-.05em] text-[#261912] md:text-7xl">Three counters.<br /><span className="text-[#a92f22]">No wrong turn.</span></h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[#684d3b]">The whole table can order differently and nobody has to compromise. That is the point.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {[
                { name: "Pappa's Pizza", eyebrow: '01 / The original slice', copy: 'Hand-stretched, oven-hot and built with a little swagger.', image: '/flyer-pappas-pizza.png', logo: '/logo-pappas-pizza.png', imageClass: 'bg-[#3d0909]', color: '#a92f22', items: ['Texan BBQ', "Papa's Special", 'Build Your Own'] },
                { name: 'Ice Cream Shake', eyebrow: '02 / The cool one', copy: 'Thick shakes, soft serve and enough topping to make a mess.', image: '/flyer-ice-cream-shake.png', logo: '/logo-ice-cream-shake.png', imageClass: 'bg-[#f5ead7]', color: '#2e7568', items: ['Strawberry Cloud', 'Salted Caramel', 'Choc Crunch'] },
                { name: "Rooster's", eyebrow: '03 / The crunch', copy: 'Crispy chicken, hot seasoning and fries that disappear first.', image: '/flyer-roosters.png', logo: '/logo-roosters.png', imageClass: 'bg-white', color: '#db8a26', items: ["Rooster's Bucket", 'Hot Bird Box', 'Wings & Fries'] },
              ].map((brand, index) => (
                <article key={brand.name} className="group overflow-hidden border border-[#3b2920]/15 bg-[#f9f3e8] shadow-[0_12px_30px_rgba(67,42,24,.06)]">
                  <div className={`relative h-72 overflow-hidden ${brand.imageClass}`}>
                    <img src={brand.image} alt={`${brand.name} promotional flyer`} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#261912]/65 via-transparent to-transparent" />
                    <div className="absolute right-4 top-4 grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-white/50 bg-[#261912]/70 p-2 backdrop-blur-sm">
                      <img src={brand.logo} alt={`${brand.name} logo`} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="absolute left-5 top-5 rounded-full px-3 py-1.5 font-mono text-[.58rem] uppercase tracking-[.12em] text-[#261912]" style={{ backgroundColor: brand.color }}>{brand.eyebrow}</span>
                    <span className="absolute bottom-5 left-5 font-display text-3xl font-bold text-[#fff4e6]">{brand.name}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-6 text-[#684d3b]">{brand.copy}</p>
                    <div className="my-5 space-y-3 border-y border-[#3b2920]/12 py-4">
                      {brand.items.map((name) => {
                        const item = menuItems.find((menuItem) => menuItem.name === name)!;
                        return <button key={name} onClick={() => addToCart(item)} className="group/item flex w-full items-center justify-between text-left" data-testid={`button-add-${item.id}`}>
                          <span className="font-medium text-[#261912]">{name}</span><span className="flex items-center gap-2 font-mono text-xs text-[#a92f22]">{money(item.price)}<Plus size={14} className="transition-transform group-hover/item:rotate-90" /></span>
                        </button>;
                      })}
                    </div>
                    <button onClick={() => scrollToId('order')} className="flex items-center gap-2 font-mono text-[.65rem] uppercase tracking-[.12em] text-[#261912] transition-colors hover:text-[#a92f22]" data-testid={`button-browse-${index}`}>Browse & order <ArrowRight size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="order" className="scroll-mt-20 bg-[#261912] py-20 text-[#f5e8d0] md:py-28">
          <div className="container-shell">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="section-kicker text-[#e8b94f]">Order at the counter, from anywhere</p><h2 className="mt-4 font-display text-5xl font-bold leading-[.9] tracking-[-.05em] md:text-7xl">Make it a<br /><span className="text-[#e8b94f]">good order.</span></h2></div>
              <p className="max-w-sm text-sm leading-6 text-[#dbcdb8]">Tap a favourite to add it. We will keep your running total right here, no account and no fuss.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {menuItems.map((item) => (
                <article key={item.id} className="group flex gap-4 border border-[#f5e8d0]/15 bg-[#32221a] p-3 transition-colors hover:border-[#e8b94f]/70" data-testid={`card-product-${item.id}`}>
                  <img src={item.image} alt={item.name} className="h-24 w-24 shrink-0 object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div><div className="flex items-start justify-between gap-2"><h3 className="font-display text-xl leading-none">{item.name}</h3>{item.tag && <span className="font-mono text-[.55rem] uppercase tracking-wider text-[#e8b94f]">{item.tag}</span>}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#bcae9b]">{item.description}</p></div>
                    <div className="mt-3 flex items-center justify-between"><span className="font-mono text-sm text-[#e8b94f]">{money(item.price)}</span><button onClick={() => addToCart(item)} className="flex items-center gap-1.5 rounded-full bg-[#d6452f] px-3 py-1.5 font-mono text-[.6rem] uppercase tracking-[.08em] text-white transition-transform hover:-translate-y-0.5" data-testid={`button-order-${item.id}`}>Add <Plus size={13} /></button></div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-7 flex flex-col items-center justify-between gap-4 border border-[#e8b94f]/35 bg-[#35231a] p-5 sm:flex-row">
              <div className="flex items-center gap-3"><Truck size={20} className="text-[#e8b94f]" /><div><p className="font-medium">Pickup or delivery, your call.</p><p className="mt-1 text-xs text-[#bcae9b]">Most orders are ready in about 25 minutes.</p></div></div>
              <button onClick={() => setCartOpen(true)} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#e8b94f] px-5 py-3 font-mono text-[.65rem] uppercase tracking-[.1em] text-[#261912] sm:w-auto" data-testid="button-review-order">Review order <ShoppingBag size={15} /></button>
            </div>
          </div>
        </section>

        <section id="gallery" className="scroll-mt-20 bg-[#e3efe7] py-20 md:py-28">
          <div className="container-shell">
            <div className="flex items-end justify-between gap-4"><div><p className="section-kicker text-[#2e7568]">Seen at Habib's</p><h2 className="mt-4 font-display text-5xl font-bold leading-[.9] tracking-[-.05em] text-[#1d423d] md:text-7xl">Good food<br /><span className="text-[#2e7568]">looks like this.</span></h2></div><p className="hidden max-w-xs text-sm leading-6 text-[#45655d] md:block">The counter is loud, the napkins go fast, and the first bite always earns a quiet moment.</p></div>
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {galleryItems.map((item, index) => (
                <button key={item.src} onClick={() => setLightbox(item)} className={`group relative overflow-hidden text-left ${index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`} data-testid={`button-gallery-${index}`}>
                  <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1d423d]/85 to-transparent p-4 pt-12 font-display text-lg text-[#f5e8d0] opacity-0 transition-opacity group-hover:opacity-100">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 bg-[#d6452f] py-20 text-[#fff4e6] md:py-28">
          <div className="container-shell grid items-center gap-12 md:grid-cols-[.8fr_1.2fr]">
            <div><p className="section-kicker text-[#f5d77b]">A little about us</p><h2 className="mt-5 font-display text-5xl font-bold leading-[.86] tracking-[-.06em] md:text-7xl">Come as you are.<br /><span className="text-[#f5d77b]">Leave happier.</span></h2></div>
            <div className="grid gap-7 md:grid-cols-2"><div><p className="text-lg leading-8 text-[#fff4e6]/90">Habib's was built for the in-between moments: the after-school hunger, the Friday catch-up, the “let's just grab something” that becomes the whole evening.</p><p className="mt-5 text-sm leading-6 text-[#fff4e6]/75">We put three very different kitchens under one roof so your people can meet in the middle. Proudly local, generously portioned, always worth the detour.</p></div><div className="border-l border-[#fff4e6]/30 pl-6"><div className="flex items-start gap-3"><Clock3 size={18} className="mt-1 text-[#f5d77b]" /><div><p className="font-display text-2xl">10:00 — 22:00</p><p className="mt-1 font-mono text-[.6rem] uppercase tracking-wider text-[#fff4e6]/70">Every day, including Sundays</p></div></div><div className="mt-8 flex items-start gap-3"><MapPin size={18} className="mt-1 text-[#f5d77b]" /><div><p className="font-display text-2xl">Samora Machel Ave</p><p className="mt-1 font-mono text-[.6rem] uppercase tracking-wider text-[#fff4e6]/70">Harare, Zimbabwe</p></div></div></div></div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 bg-[#f3ead9] py-20 md:py-28">
          <div className="container-shell grid gap-12 md:grid-cols-[.8fr_1.2fr]">
            <div><p className="section-kicker text-[#a92f22]">Say hello</p><h2 className="mt-5 font-display text-5xl font-bold leading-[.88] tracking-[-.05em] text-[#261912] md:text-7xl">Bring your<br /><span className="text-[#a92f22]">big appetite.</span></h2><p className="mt-7 max-w-sm text-sm leading-6 text-[#684d3b]">Questions, birthday tables, big office orders? The team is right here.</p><div className="mt-8 space-y-4"><a href="tel:+263772401184" className="flex items-center gap-3 font-medium text-[#261912]" data-testid="link-phone"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8b94f]"><Phone size={15} /></span>+263 77 240 1184</a><a href="mailto:hello@habibsfoodmall.co.zw" className="flex items-center gap-3 font-medium text-[#261912]" data-testid="link-email"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8b94f]">@</span>hello@habibsfoodmall.co.zw</a></div></div>
            {contactSent ? <div className="flex min-h-[350px] flex-col justify-center border border-[#3b2920]/15 bg-[#fbf7ef] p-8 md:p-12"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#2e7568] text-white"><Check size={22} /></span><h3 className="mt-6 font-display text-4xl text-[#261912]">Message received.</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#684d3b]">Someone from the Habib's team will get back to you soon. In the meantime, you know where to find us.</p><button onClick={() => setContactSent(false)} className="mt-7 w-fit font-mono text-[.65rem] uppercase tracking-[.12em] text-[#a92f22]" data-testid="button-send-another">Send another message</button></div> : <form onSubmit={submitContact} className="border border-[#3b2920]/15 bg-[#fbf7ef] p-6 md:p-10"><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="section-kicker text-[#684d3b]">Your name</span><input required name="name" className="mt-2 w-full border-b border-[#3b2920]/25 bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[#a92f22]" placeholder="Tell us who you are" data-testid="input-contact-name" /></label><label className="block"><span className="section-kicker text-[#684d3b]">Email address</span><input required type="email" name="email" className="mt-2 w-full border-b border-[#3b2920]/25 bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[#a92f22]" placeholder="you@example.com" data-testid="input-contact-email" /></label></div><label className="mt-7 block"><span className="section-kicker text-[#684d3b]">How can we help?</span><textarea required name="message" rows={4} className="mt-2 w-full resize-none border-b border-[#3b2920]/25 bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[#a92f22]" placeholder="A table for twelve? A question about the menu?" data-testid="input-contact-message" /></label><button type="submit" className="mt-8 flex items-center gap-3 rounded-full bg-[#a92f22] px-6 py-3.5 font-mono text-[.65rem] uppercase tracking-[.1em] text-[#fff4e6] transition-transform hover:-translate-y-0.5" data-testid="button-contact-submit">Send it over <ArrowRight size={15} /></button></form>}
          </div>
        </section>
      </main>

      <footer className="bg-[#261912] py-12 text-[#f5e8d0]">
        <div className="container-shell">
          <div className="grid gap-10 border-b border-[#f5e8d0]/15 pb-10 md:grid-cols-[1.1fr_.8fr_1.1fr]">
            <div><Logo inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-[#bcae9b]">One lively Harare stop for pizza, shakes, chicken and the people you came to see.</p><div className="mt-5 flex gap-3"><a href="https://instagram.com" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-[#f5e8d0]/25 transition-colors hover:border-[#e8b94f] hover:text-[#e8b94f]" data-testid="link-instagram"><Instagram size={16} /></a><a href="https://youtube.com" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-[#f5e8d0]/25 transition-colors hover:border-[#e8b94f] hover:text-[#e8b94f]" data-testid="link-youtube"><Youtube size={16} /></a></div></div>
            <div><p className="section-kicker text-[#e8b94f]">Explore</p><div className="mt-5 grid grid-cols-2 gap-y-3"><a href="#menu" className="text-sm text-[#bcae9b] hover:text-[#e8b94f]" data-testid="link-footer-menu">Menu</a><a href="#gallery" className="text-sm text-[#bcae9b] hover:text-[#e8b94f]" data-testid="link-footer-gallery">Gallery</a><a href="#about" className="text-sm text-[#bcae9b] hover:text-[#e8b94f]" data-testid="link-footer-about">About us</a><a href="#contact" className="text-sm text-[#bcae9b] hover:text-[#e8b94f]" data-testid="link-footer-contact">Contact</a></div></div>
            <div><p className="section-kicker text-[#e8b94f]">The good stuff, occasionally</p>{subscribed ? <div className="mt-5 flex items-center gap-2 text-sm text-[#bcae9b]"><Check size={16} className="text-[#e8b94f]" /> You're on the list.</div> : <form onSubmit={submitNewsletter} className="mt-4 flex border-b border-[#f5e8d0]/35 pb-2"><label htmlFor="newsletter" className="sr-only">Email for newsletter</label><input id="newsletter" required type="email" className="min-w-0 flex-1 bg-transparent text-sm text-[#f5e8d0] outline-none placeholder:text-[#bcae9b]" placeholder="Your email address" data-testid="input-newsletter" /><button type="submit" aria-label="Subscribe to newsletter" className="text-[#e8b94f]" data-testid="button-newsletter"><ArrowRight size={18} /></button></form>}</div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 font-mono text-[.58rem] uppercase tracking-[.12em] text-[#8f7f6e] sm:flex-row"><span>© 2025 Habib's Food Mall · Website by Shepherd Ndiraya</span><span>Made for hungry Harare</span></div>
        </div>
      </footer>

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#261912] px-5 py-3 text-sm text-[#f5e8d0] shadow-2xl" data-testid="status-add-to-cart"><Check size={15} className="text-[#e8b94f]" /> {toast}</div>}

      {cartOpen && <div className="fixed inset-0 z-50"><button onClick={() => setCartOpen(false)} className="absolute inset-0 cursor-default bg-[#261912]/65" aria-label="Close cart" data-testid="button-close-cart-overlay" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f3ead9] text-[#261912] shadow-2xl"><div className="flex items-center justify-between border-b border-[#3b2920]/15 p-6"><div><p className="section-kicker text-[#a92f22]">Your order</p><h2 className="mt-2 font-display text-3xl">Ready when you are.</h2></div><button onClick={() => setCartOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#3b2920]/20" aria-label="Close cart" data-testid="button-close-cart"><X size={17} /></button></div><div className="flex-1 overflow-y-auto p-6">{cart.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#e8b94f]"><ShoppingBag size={24} /></span><h3 className="mt-5 font-display text-2xl">Nothing in the bag yet.</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[#684d3b]">The hard part is choosing. Start with something hot, cold, or crunchy.</p><button onClick={() => { setCartOpen(false); scrollToId('order'); }} className="mt-6 rounded-full bg-[#a92f22] px-5 py-3 font-mono text-[.65rem] uppercase tracking-[.1em] text-white" data-testid="button-empty-start-order">Start an order</button></div> : <div className="space-y-4">{cart.map((item) => <div key={item.id} className="flex gap-3 border-b border-[#3b2920]/12 pb-4" data-testid={`row-cart-${item.id}`}><img src={item.image} alt="" className="h-16 w-16 object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="font-display text-lg leading-none">{item.name}</h3><span className="font-mono text-xs">{money(item.price * item.quantity)}</span></div><p className="mt-1 text-xs text-[#684d3b]">{item.brand}</p><div className="mt-3 flex items-center gap-3"><button onClick={() => updateQuantity(item.id, -1)} className="grid h-6 w-6 place-items-center rounded-full border border-[#3b2920]/25" aria-label={`Remove one ${item.name}`} data-testid={`button-decrease-${item.id}`}><Minus size={12} /></button><span className="font-mono text-xs" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="grid h-6 w-6 place-items-center rounded-full border border-[#3b2920]/25" aria-label={`Add one ${item.name}`} data-testid={`button-increase-${item.id}`}><Plus size={12} /></button></div></div></div>)}</div>}</div>{cart.length > 0 && <div className="border-t border-[#3b2920]/15 p-6"><div className="flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-wider text-[#684d3b]">Subtotal</span><span className="font-display text-3xl">{money(cartTotal)}</span></div><p className="mt-2 text-xs text-[#684d3b]">Delivery fees are confirmed at checkout.</p>{orderComplete ? <div className="mt-5 flex items-center gap-2 bg-[#d9eee7] p-4 text-sm text-[#1d423d]" data-testid="status-order-complete"><Check size={17} /> Order noted. We'll see you soon.</div> : <button onClick={() => setOrderComplete(true)} className="mt-5 w-full rounded-full bg-[#d6452f] py-4 font-mono text-[.68rem] uppercase tracking-[.12em] text-white" data-testid="button-checkout">Continue to checkout</button>}</div>}</aside></div>}

      {lightbox && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#261912]/90 p-4" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)}><button onClick={() => setLightbox(null)} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-[#f5e8d0]/35 text-[#f5e8d0]" aria-label="Close gallery image" data-testid="button-close-lightbox"><X size={18} /></button><div className="max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}><img src={lightbox.src} alt={lightbox.alt} className="max-h-[78vh] w-auto object-contain" /><p className="mt-4 font-display text-2xl text-[#f5e8d0]">{lightbox.title}</p></div></div>}
    </div>
  );
}

function Router() {
  return <Switch><Route path="/" component={AppShell} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;