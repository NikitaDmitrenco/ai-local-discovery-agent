import { getSupabaseAdminClient } from '../lib/supabaseClient';
import { PLACES_REGISTRY } from './seedData';

async function seed() {
  const supabase = getSupabaseAdminClient();
  console.log('Connecting to Supabase...');

  // Test query on 'places'
  const { data: testData, error: testError } = await supabase.from('places').select('id').limit(1);

  if (testError) {
    console.error('Error querying places table:', testError);
    console.log('\n--- SQL REQUIRED ---');
    console.log('Please execute the SQL in Supabase SQL Editor:');
    return;
  }

  console.log('Table "places" exists! Inserting records...');

  const formattedPlaces = PLACES_REGISTRY.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    address: p.address,
    lat: p.coordinates.lat,
    lng: p.coordinates.lng,
    rating: p.rating,
    user_ratings_total: p.userRatingsTotal,
    opening_hours: p.openingHours || [],
    types: p.types || [],
    photo_urls: p.photoUrls || [],
    website: p.website || null,
    phone_number: p.phoneNumber || null,
    raw_attributes: p.rawAttributes || {},
  }));

  const { data, error } = await supabase.from('places').upsert(formattedPlaces, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting places:', error);
    return;
  }

  console.log('Successfully seeded ' + formattedPlaces.length + ' places into Supabase!');

  // Seed sample verified reviews
  const reviewsData = [
    {
      place_id: 'mock-ghidighici-wakepark',
      author_name: 'Alex M.',
      rating: 5,
      text: 'Great wakeboarding cable park! The lake water is clean, equipment is top quality, and the wooden cabins are very cozy for overnight stays.',
      relative_time_description: '2 weeks ago',
    },
    {
      place_id: 'mock-costesti-resort',
      author_name: 'Elena V.',
      rating: 5,
      text: 'Lovely lake resort. Rented SUP boards and had a great dinner overlooking the water. Clean villas for overnight stay.',
      relative_time_description: '1 month ago',
    },
    {
      place_id: 'mock-nistru-glamping',
      author_name: 'Ion B.',
      rating: 5,
      text: 'Magical glamping right by the river. Complete silence, starry sky, and great morning kayaking along the canyon.',
      relative_time_description: '3 weeks ago',
    },
    {
      place_id: 'rest-fuior-gourmet',
      author_name: 'Natalia S.',
      rating: 5,
      text: 'Идеальное место для праздничного ужина и дня рождения. Авторская подача, прекрасное обслуживание и винная карта.',
      relative_time_description: '3 дня назад',
    },
    {
      place_id: 'spa-aquaterra-oasis',
      author_name: 'Irina L.',
      rating: 5,
      text: 'Роскошный термальный комплекс. Хаммам, бассейны и массаж на высшем уровне для полного расслабления.',
      relative_time_description: '2 недели назад',
    },
    {
      place_id: 'work-tucano-costa-rica',
      author_name: 'Pavel D.',
      rating: 5,
      text: 'Отличный кофе, быстрый интернет и много розеток. Удобно поработать несколько часов с ноутбуком.',
      relative_time_description: 'вчера',
    },
    {
      place_id: 'bar-513-speakeasy',
      author_name: 'Andrei C.',
      rating: 5,
      text: 'Секретный спикизи бар с винилом и невероятными авторскими коктейлями. Без суеты и толпы.',
      relative_time_description: '4 дня назад',
    },
    {
      place_id: 'act-enduro-quad-moldova',
      author_name: 'Dan S.',
      rating: 5,
      text: 'Море адреналина! Маршруты по лесам и холмам просто супер. Инструкторы классные.',
      relative_time_description: 'неделю назад',
    },
  ];

  await supabase.from('reviews').upsert(reviewsData);
  console.log('Successfully seeded reviews into Supabase!');
}

seed().catch(console.error);
