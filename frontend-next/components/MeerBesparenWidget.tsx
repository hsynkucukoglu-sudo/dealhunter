'use client'

// Daisycon affiliate deals — wi=420902 (website ID), si=advertiser, li=link
const DEALS = [
  {
    category: '⚡ Energie',
    items: [
      {
        name: 'ENGIE',
        tagline: 'Gas & stroom vergelijken',
        cta: 'Bekijk tarief',
        color: '#0064A8',
        url: 'https://ds1.nl/c/?si=365&li=20757&wi=420902',
      },
      {
        name: 'Vattenfall',
        tagline: 'Duurzame energie',
        cta: 'Bekijk tarief',
        color: '#009B3A',
        url: 'https://lt45.net/c/?si=2036&li=119986&wi=420902',
      },
      {
        name: 'energiedirect',
        tagline: 'Goedkoop energie',
        cta: 'Bekijk tarief',
        color: '#E85800',
        url: 'https://lt45.net/c/?si=924&li=55221&wi=420902',
      },
      {
        name: 'Oxxio',
        tagline: 'Stroom & gas',
        cta: 'Bekijk tarief',
        color: '#5A2D82',
        url: 'https://ds1.nl/c/?si=2028&li=119834&wi=420902',
      },
    ],
  },
  {
    category: '✈️ Reizen',
    items: [
      {
        name: 'CheapTickets',
        tagline: 'Goedkope vluchten',
        cta: 'Zoek vlucht',
        color: '#D9251D',
        url: 'https://ds1.nl/c/?si=1096&li=70202&wi=420902',
      },
      {
        name: 'Tjingo',
        tagline: 'Vakantiedeals',
        cta: 'Bekijk deals',
        color: '#FF6B00',
        url: 'https://ds1.nl/c/?si=2554&li=148518&wi=420902',
      },
      {
        name: 'Vakantiediscounter',
        tagline: 'Last minute vakanties',
        cta: 'Bekijk deals',
        color: '#006FB9',
        url: 'https://ds1.nl/c/?si=7805&li=1362777&wi=420902',
      },
      {
        name: 'Youfone',
        tagline: 'Goedkoop sim only',
        cta: 'Bekijk abonnementen',
        color: '#E4002B',
        url: 'https://lt45.net/c/?si=1174&li=73446&wi=420902',
      },
    ],
  },
]

export function MeerBesparenWidget() {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 18 }}>💡</span>
        <h2
          className="text-base font-black uppercase tracking-wide"
          style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Meer besparen
        </h2>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(201,193,182,0.4)', color: '#9C9389' }}
        >
          Gesponsord
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {DEALS.map((group) => (
          <div key={group.category}>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: '#9C9389' }}
            >
              {group.category}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {group.items.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex flex-col gap-2 px-3 py-3 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(201,193,182,0.4)',
                    boxShadow: '0 2px 0 #DDD0C4',
                    textDecoration: 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-none"
                      style={{ background: item.color }}
                    />
                    <span
                      className="text-sm font-black truncate"
                      style={{ color: '#1A1A1A' }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: '#9C9389' }}>
                    {item.tagline}
                  </p>
                  <span
                    className="text-[11px] font-bold mt-auto"
                    style={{ color: item.color }}
                  >
                    {item.cta} →
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
