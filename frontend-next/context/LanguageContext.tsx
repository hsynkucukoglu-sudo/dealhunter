'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'nl' | 'en' | 'tr'

export const translations = {
  nl: {
    weeklyDeals: 'Wekelijkse Aanbiedingen',
    heroTitle1: "NEDERLAND'S",
    heroTitle2: 'BESTE PRIJZEN',
    searchPlaceholder: 'Zoek product of supermarkt...',
    scanBtn: 'Ontdek Aanbiedingen',
    scanning: 'Bezig...',
    activeProducts: 'actieve producten',
    savings: 'Besparing',
    allMarkets: 'Alle',
    campaignsOnly: 'Alleen Acties',
    loadingProducts: 'Laden...',
    scrapingMsg: 'Supermarktfolders worden gescand, even geduld...',
    noProducts: 'Geen producten gevonden',
    noProductsDesc: 'Gebruik de + knop om handmatig toe te voegen of klik op Ontdek Aanbiedingen.',
    addToCart: 'In winkelwagen',
    validUntil: 'geldig t/m',
    myCart: 'Mijn winkelwagen',
    cartEmpty: 'Winkelwagen leeg',
    cartEmptyDesc: 'Klik op de winkelwagen knop op een productkaart om toe te voegen',
    totalSavings: 'Totale besparing',
    totalCost: 'Totaalbedrag',
    clear: 'Leegmaken',
    shareWhatsApp: 'Delen via WhatsApp',
    whatsappHeader: '🛍️ *Dealhunter Boodschappenlijst*\n\n',
    whatsappTotal: '💰 *Totaalbedrag:*',
    whatsappSavings: '🔥 *Totale besparing:*',
    addProduct: 'Product Toevoegen',
    addProductDesc: 'Voeg handmatig een actieproduct toe',
    productName: 'Productnaam',
    productNamePlaceholder: 'bijv: Biologische Tomaten',
    market: 'Supermarkt',
    originalPrice: 'Normale prijs',
    discountedPrice: 'Actieprijs',
    imageUrl: 'Afbeelding URL',
    imageUrlOptional: '(optioneel)',
    validUntilLabel: 'Geldig tot',
    campaignProduct: 'Actieproduct',
    campaignProductDesc: 'Markeren als wekelijkse actie',
    cancel: 'Annuleren',
    add: 'Toevoegen',
    adding: 'Toevoegen...',
    items: 'producten',
    item: 'product',
    viewDeal: 'Bekijk aanbieding',
  },
  en: {
    weeklyDeals: 'Weekly Deals',
    heroTitle1: "NETHERLANDS'",
    heroTitle2: 'BEST PRICES',
    searchPlaceholder: 'Search product or supermarket...',
    scanBtn: 'Discover Deals',
    scanning: 'Scanning...',
    activeProducts: 'active products',
    savings: 'Savings',
    allMarkets: 'All',
    campaignsOnly: 'Deals Only',
    loadingProducts: 'Loading...',
    scrapingMsg: 'Scanning supermarket flyers, please wait...',
    noProducts: 'No products found',
    noProductsDesc: 'Use the + button to add manually or click Discover Deals.',
    addToCart: 'Add to Cart',
    validUntil: 'valid until',
    myCart: 'My Cart',
    cartEmpty: 'Cart is Empty',
    cartEmptyDesc: 'Click the basket button on a product card to add items',
    totalSavings: 'Total Savings',
    totalCost: 'Total Amount',
    clear: 'Clear',
    shareWhatsApp: 'Share on WhatsApp',
    whatsappHeader: '🛍️ *Dealhunter Shopping List*\n\n',
    whatsappTotal: '💰 *Total Amount:*',
    whatsappSavings: '🔥 *Total Savings:*',
    addProduct: 'Add Product',
    addProductDesc: 'Manually add a deal product',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g: Organic Tomatoes',
    market: 'Supermarket',
    originalPrice: 'Regular Price',
    discountedPrice: 'Deal Price',
    imageUrl: 'Image URL',
    imageUrlOptional: '(optional)',
    validUntilLabel: 'Valid Until',
    campaignProduct: 'Deal Product',
    campaignProductDesc: 'Mark as weekly special deal',
    cancel: 'Cancel',
    add: 'Add',
    adding: 'Adding...',
    items: 'items',
    item: 'item',
    viewDeal: 'View deal',
  },
  tr: {
    weeklyDeals: 'Haftalık Fırsatlar',
    heroTitle1: "HOLLANDA'NIN",
    heroTitle2: 'EN İYİ FİYATLARI',
    searchPlaceholder: 'Ürün veya market ara...',
    scanBtn: 'Fırsatları Keşfet',
    scanning: 'Taranıyor…',
    activeProducts: 'aktif ürün',
    savings: 'Tasarruf',
    allMarkets: 'Tümü',
    campaignsOnly: 'Sadece Kampanyalar',
    loadingProducts: 'Yükleniyor...',
    scrapingMsg: 'Süpermarket bültenleri taranıyor, lütfen bekleyin...',
    noProducts: 'Ürün bulunamadı',
    noProductsDesc: 'Sağ alttaki + butonu ile manuel ekleyebilir veya Fırsatları Keşfet butonuna basabilirsiniz.',
    addToCart: 'Sepete Ekle',
    validUntil: 'tarihine kadar',
    myCart: 'Sepetim',
    cartEmpty: 'Sepet Boş',
    cartEmptyDesc: 'Ürün kartlarındaki sepet butonuna tıklayarak ürün ekleyin',
    totalSavings: 'Toplam Tasarruf',
    totalCost: 'Toplam Tutar',
    clear: 'Temizle',
    shareWhatsApp: 'WhatsApp Paylaş',
    whatsappHeader: '🛍️ *Dealhunter Alışveriş Listem*\n\n',
    whatsappTotal: '💰 *Toplam Tutar:*',
    whatsappSavings: '🔥 *Toplam Tasarruf:*',
    addProduct: 'Yeni Ürün Ekle',
    addProductDesc: 'Manuel olarak kampanya ürünü ekleyin',
    productName: 'Ürün Adı',
    productNamePlaceholder: 'ör: Organik Domates',
    market: 'Market',
    originalPrice: 'Normal Fiyat',
    discountedPrice: 'İndirimli Fiyat',
    imageUrl: 'Resim URL',
    imageUrlOptional: '(opsiyonel)',
    validUntilLabel: 'Son Geçerlilik',
    campaignProduct: 'Kampanya Ürünü',
    campaignProductDesc: 'Haftalık özel kampanya olarak işaretle',
    cancel: 'İptal',
    add: 'Ekle',
    adding: 'Ekleniyor…',
    items: 'ürün',
    item: 'ürün',
    viewDeal: 'Fırsatı gör',
  },
}

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof translations.nl
}

const LanguageContext = createContext<LanguageContextType>({ lang: 'nl', setLang: () => {}, t: translations.nl })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('nl')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
