import { PlaceSearchProvider, RawPlaceItem, RawReviewItem } from '../types';
import { Coordinates } from '../../domain/types';
import { PLACES_REGISTRY } from '../../data/seedData';
import { haversineDistanceKm } from '../../utils/geo';

export class MockPlaceProvider implements PlaceSearchProvider {
  name = 'MockPlaceSearchEngine';

  private mockDatabase: RawPlaceItem[] = PLACES_REGISTRY;

  private mockReviews: Record<string, RawReviewItem[]> = {
    'rest-fuior-gourmet': [
      {
        authorName: 'Alexandru M.',
        rating: 5,
        text: 'Прекрасный ресторан для празднования дня рождения! Отличная современная молдавская кухня, великолепная подача и сервис на высшем уровне.',
        relativeTimeDescription: '2 недели назад',
      },
      {
        authorName: 'Elena V.',
        rating: 5,
        text: 'Отмечали юбилей в отдельном зале — всё прошло безупречно. Очень уютно, богатое винное меню.',
        relativeTimeDescription: 'месяц назад',
      },
    ],
    'rest-pegas-terrace': [
      {
        authorName: 'Dmitri K.',
        rating: 5,
        text: 'Лучшие стейки в Кишиневе! Идеальное место для дня рождения компанией. Терраса летом просто сказка.',
        relativeTimeDescription: 'неделю назад',
      },
      {
        authorName: 'Natalia S.',
        rating: 5,
        text: 'Отличный ресторан для семейного праздника. Вкуснейшее мясо, детская зона и приветливый персонал.',
        relativeTimeDescription: '3 недели назад',
      },
    ],
    'rest-gastrobar-chisinau': [
      {
        authorName: 'Mihai T.',
        rating: 5,
        text: 'Атмосфера топ! Открытая кухня, потрясающие авторские блюда и классные коктейли. Праздновали ДР с друзьями на ура.',
        relativeTimeDescription: 'месяц назад',
      },
    ],
    'rest-kiku-steak-wine': [
      {
        authorName: 'Victor R.',
        rating: 5,
        text: 'Солидный ресторан для важного события. Мясо тает во рту, сомелье подобрал идеальное вино.',
        relativeTimeDescription: '2 месяца назад',
      },
    ],
    'rest-zaxi-rooftop': [
      {
        authorName: 'Olga P.',
        rating: 5,
        text: 'Панорамный вид на весь ночной Кишинев с крыши. Диджей, вкусные коктейли и азиатская кухня. Лучшее место для веселого ДР!',
        relativeTimeDescription: 'неделю назад',
      },
    ],
    'wine-carpe-diem': [
      {
        authorName: 'Sergiu B.',
        rating: 5,
        text: 'Идеальное романтическое место для свидания. Уютная камерная атмосфера, огромный выбор редких молдавских вин.',
        relativeTimeDescription: '3 недели назад',
      },
    ],
    'mock-ghidighici-wakepark': [
      {
        authorName: 'Alexandru M.',
        rating: 5,
        text: 'Best wakeboarding in Moldova! The cable system is top notch and the instructors are super helpful. Stayed in the wooden cabin overnight, sunset was incredible.',
        relativeTimeDescription: '2 weeks ago',
      },
      {
        authorName: 'Elena V.',
        rating: 5,
        text: 'Super peaceful on Sunday evenings. Very quiet outside the city. The cabins are warm and have clean showers.',
        relativeTimeDescription: 'a month ago',
      },
    ],
    'mock-costesti-resort': [
      {
        authorName: 'Sergiu R.',
        rating: 5,
        text: 'Lovely lake resort. Rented SUP boards and had a great dinner overlooking the water. Clean villas for overnight stay.',
        relativeTimeDescription: '1 month ago',
      },
    ],
    'mock-nistru-glamping': [
      {
        authorName: 'Ion B.',
        rating: 5,
        text: 'Magical glamping right by the river. Complete silence, starry sky, and great morning kayaking along the canyon.',
        relativeTimeDescription: '3 weeks ago',
      },
    ],
    'spa-aquaterra-oasis': [
      {
        authorName: 'Irina L.',
        rating: 5,
        text: 'Роскошный термальный комплекс. Хаммам, бассейны и массаж на высшем уровне для полного расслабления.',
        relativeTimeDescription: '2 недели назад',
      },
    ],
    'work-tucano-costa-rica': [
      {
        authorName: 'Pavel D.',
        rating: 5,
        text: 'Отличный кофе, быстрый интернет и много розеток. Удобно поработать несколько часов с ноутбуком.',
        relativeTimeDescription: 'вчера',
      },
    ],
    'bar-513-speakeasy': [
      {
        authorName: 'Andrei C.',
        rating: 5,
        text: 'Секретный спикизи бар с винилом и невероятными авторскими коктейлями. Без суеты и толпы.',
        relativeTimeDescription: '4 дня назад',
      },
    ],
    'act-enduro-quad-moldova': [
      {
        authorName: 'Dan S.',
        rating: 5,
        text: 'Море адреналина! Маршруты по лесам и холмам просто супер. Инструкторы классные.',
        relativeTimeDescription: 'неделю назад',
      },
    ],
  };

  async searchPlaces(
    queries: string[],
    location: Coordinates,
    radiusKm: number
  ): Promise<RawPlaceItem[]> {
    if (!queries || queries.length === 0) {
      return this.mockDatabase.slice(0, 8);
    }

    const queryTokens = queries
      .join(' ')
      .toLowerCase()
      .split(/[\s,–—-]+/)
      .filter((t) => t.length > 2);

    // Score and filter candidates based on query tokens and location radius
    const scored = this.mockDatabase.map((place) => {
      const dist = haversineDistanceKm(location, place.coordinates);
      let score = 0;

      const placeText = (
        place.name +
        ' ' +
        place.category +
        ' ' +
        (place.types?.join(' ') || '') +
        ' ' +
        JSON.stringify(place.rawAttributes || {})
      ).toLowerCase();

      for (const token of queryTokens) {
        if (token.length < 3) continue;
        if (placeText.includes(token)) {
          if (token.includes('wake') || token.includes('вейк') || token.includes('water') || token.includes('вод') || token.includes('restaur') || token.includes('рестор') || token.includes('cocktail') || token.includes('коктейл') || token.includes('banya') || token.includes('бан') || token.includes('spa') || token.includes('спа') || token.includes('quad') || token.includes('квадр') || token.includes('cowork') || token.includes('коворк')) {
            score += 40;
          } else {
            score += 15;
          }
        }
      }

      // Bonus for higher rating
      if (place.rating) {
        score += place.rating * 2;
      }

      // Proximity bonus if within target radius
      if (dist <= radiusKm) {
        score += 15;
      }

      return { place, score, dist };
    });

    // Filter within reasonable radius (radiusKm * 1.6) unless too few candidates
    const radiusFiltered = scored.filter((s) => s.dist <= (radiusKm || 50) * 1.6);
    const candidatePool = radiusFiltered.length >= 4 ? radiusFiltered : scored;

    // Sort by match score descending, then by distance
    candidatePool.sort((a, b) => b.score - a.score || a.dist - b.dist);

    return candidatePool.slice(0, 8).map((s) => s.place);
  }

  async getPlaceDetails(placeId: string): Promise<RawPlaceItem | null> {
    return this.mockDatabase.find((p) => p.id === placeId) || null;
  }

  async getReviews(placeId: string): Promise<RawReviewItem[]> {
    return (
      this.mockReviews[placeId] || [
        {
          authorName: 'Verified Visitor',
          rating: 5,
          text: 'Great verified place with excellent atmosphere, verified amenities, and welcoming staff.',
          relativeTimeDescription: 'recently',
        },
      ]
    );
  }

  async getPhotos(placeId: string): Promise<string[]> {
    const place = this.mockDatabase.find((p) => p.id === placeId);
    return place?.photoUrls || [];
  }
}
