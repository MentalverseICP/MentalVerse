
interface MapPoint {
  coordinates: [number, number];
  type: "wellness" | "support" | "crisis" | "therapy";
  country: string;
}

export const data: MapPoint[] = [
  // USA - Major cities and regions
  { coordinates: [-74.006, 40.7128], type: "support", country: "USA" }, // New York
  { coordinates: [-118.2437, 34.0522], type: "therapy", country: "USA" }, // Los Angeles
  { coordinates: [-87.6298, 41.8781], type: "crisis", country: "USA" }, // Chicago
  { coordinates: [-95.3698, 29.7604], type: "wellness", country: "USA" }, // Houston
  { coordinates: [-75.1652, 39.9526], type: "support", country: "USA" }, // Philadelphia
  { coordinates: [-112.074, 33.4484], type: "therapy", country: "USA" }, // Phoenix
  { coordinates: [-98.4936, 29.4241], type: "crisis", country: "USA" }, // San Antonio
  { coordinates: [-117.1611, 32.7157], type: "wellness", country: "USA" }, // San Diego
  { coordinates: [-96.7970, 32.7767], type: "support", country: "USA" }, // Dallas
  { coordinates: [-121.4944, 38.5816], type: "therapy", country: "USA" }, // Sacramento
  { coordinates: [-122.4194, 37.7749], type: "support", country: "USA" }, // San Francisco
  { coordinates: [-122.6765, 45.5152], type: "crisis", country: "USA" }, // Portland
  { coordinates: [-71.0589, 42.3601], type: "wellness", country: "USA" }, // Boston
  { coordinates: [-83.0458, 42.3314], type: "support", country: "USA" }, // Detroit
  { coordinates: [-80.1918, 25.7617], type: "therapy", country: "USA" }, // Miami
  { coordinates: [-104.9903, 39.7392], type: "crisis", country: "USA" }, // Denver
  { coordinates: [-122.3321, 47.6062], type: "wellness", country: "USA" }, // Seattle
  { coordinates: [-77.0369, 38.9072], type: "support", country: "USA" }, // Washington DC
  { coordinates: [-84.3880, 33.7490], type: "therapy", country: "USA" }, // Atlanta
  { coordinates: [-90.0715, 29.9511], type: "crisis", country: "USA" }, // New Orleans

  // China - Major cities
  { coordinates: [116.4074, 39.9042], type: "support", country: "China" }, // Beijing
  { coordinates: [121.4737, 31.2304], type: "wellness", country: "China" }, // Shanghai
  { coordinates: [113.2644, 23.1291], type: "crisis", country: "China" }, // Guangzhou
  { coordinates: [114.0579, 22.5431], type: "therapy", country: "China" }, // Shenzhen
  { coordinates: [104.0668, 30.5728], type: "support", country: "China" }, // Chengdu
  { coordinates: [108.9480, 34.2588], type: "wellness", country: "China" }, // Xi'an
  { coordinates: [120.1614, 30.2936], type: "crisis", country: "China" }, // Hangzhou
  { coordinates: [117.2692, 39.1439], type: "therapy", country: "China" }, // Tianjin
  { coordinates: [106.5513, 29.5630], type: "support", country: "China" }, // Chongqing
  { coordinates: [118.7669, 32.0415], type: "wellness", country: "China" }, // Nanjing
  { coordinates: [114.2734, 30.5943], type: "crisis", country: "China" }, // Wuhan
  { coordinates: [112.5387, 37.8957], type: "therapy", country: "China" }, // Taiyuan

  // UK - Major cities
  { coordinates: [-0.1276, 51.5074], type: "crisis", country: "UK" }, // London
  { coordinates: [-2.2426, 53.4808], type: "support", country: "UK" }, // Manchester
  { coordinates: [-2.9916, 53.4084], type: "wellness", country: "UK" }, // Liverpool
  { coordinates: [-1.8904, 52.4862], type: "therapy", country: "UK" }, // Birmingham
  { coordinates: [-1.0873, 53.9588], type: "crisis", country: "UK" }, // York
  { coordinates: [-3.1883, 55.9533], type: "support", country: "UK" }, // Edinburgh
  { coordinates: [-4.2518, 55.8642], type: "wellness", country: "UK" }, // Glasgow
  { coordinates: [-1.6131, 54.9783], type: "therapy", country: "UK" }, // Newcastle
  { coordinates: [-2.5879, 51.4545], type: "crisis", country: "UK" }, // Bristol
  { coordinates: [-1.2577, 51.7520], type: "support", country: "UK" }, // Oxford

  // Australia - Major cities
  { coordinates: [151.2093, -33.8688], type: "wellness", country: "Australia" }, // Sydney
  { coordinates: [144.9631, -37.8136], type: "therapy", country: "Australia" }, // Melbourne
  { coordinates: [153.0251, -27.4698], type: "crisis", country: "Australia" }, // Brisbane
  { coordinates: [138.6007, -34.9285], type: "support", country: "Australia" }, // Adelaide
  { coordinates: [115.8605, -31.9505], type: "wellness", country: "Australia" }, // Perth
  { coordinates: [147.1441, -42.8821], type: "therapy", country: "Australia" }, // Hobart
  { coordinates: [149.1300, -35.2809], type: "crisis", country: "Australia" }, // Canberra
  { coordinates: [130.8456, -12.4634], type: "support", country: "Australia" }, // Darwin

  // Botswana - Major cities
  { coordinates: [25.9066, -24.6282], type: "therapy", country: "Botswana" }, // Gaborone
  { coordinates: [25.5082, -25.1653], type: "support", country: "Botswana" }, // Kanye
  { coordinates: [26.3123, -24.5450], type: "wellness", country: "Botswana" }, // Molepolole
  { coordinates: [27.4858, -21.1789], type: "crisis", country: "Botswana" }, // Francistown
  { coordinates: [23.4265, -22.2312], type: "therapy", country: "Botswana" }, // Maun
  { coordinates: [26.7918, -25.1445], type: "support", country: "Botswana" }, // Lobatse

  // Global cities
  { coordinates: [2.3522, 48.8566], type: "therapy", country: "All" }, // Paris, France
  { coordinates: [13.405, 52.52], type: "support", country: "All" }, // Berlin, Germany
  { coordinates: [12.4964, 41.9028], type: "wellness", country: "All" }, // Rome, Italy
  { coordinates: [-3.7037, 40.4165], type: "crisis", country: "All" }, // Madrid, Spain
  { coordinates: [37.6173, 55.7558], type: "wellness", country: "All" }, // Moscow, Russia
  { coordinates: [139.6917, 35.6895], type: "crisis", country: "All" }, // Tokyo, Japan
  { coordinates: [126.9780, 37.5665], type: "therapy", country: "All" }, // Seoul, South Korea
  { coordinates: [77.2090, 28.6139], type: "support", country: "All" }, // New Delhi, India
  { coordinates: [72.8777, 19.0760], type: "wellness", country: "All" }, // Mumbai, India
  { coordinates: [103.8198, 1.3521], type: "crisis", country: "All" }, // Singapore
  { coordinates: [100.5018, 13.7563], type: "therapy", country: "All" }, // Bangkok, Thailand
  { coordinates: [106.8456, -6.2088], type: "support", country: "All" }, // Jakarta, Indonesia
  { coordinates: [121.5654, 25.0330], type: "wellness", country: "All" }, // Taipei, Taiwan
  { coordinates: [114.1694, 22.3193], type: "crisis", country: "All" }, // Hong Kong
  { coordinates: [-46.6333, -23.5505], type: "therapy", country: "All" }, // São Paulo, Brazil
  { coordinates: [-43.1729, -22.9068], type: "support", country: "All" }, // Rio de Janeiro, Brazil
  { coordinates: [-58.3816, -34.6037], type: "wellness", country: "All" }, // Buenos Aires, Argentina
  { coordinates: [-70.6693, -33.4489], type: "crisis", country: "All" }, // Santiago, Chile
  { coordinates: [-99.1332, 19.4326], type: "therapy", country: "All" }, // Mexico City, Mexico
  { coordinates: [31.2357, 30.0444], type: "support", country: "All" }, // Cairo, Egypt
  { coordinates: [18.4241, -33.9249], type: "wellness", country: "All" }, // Cape Town, South Africa
  { coordinates: [28.0473, -26.2041], type: "crisis", country: "All" }, // Johannesburg, South Africa
  { coordinates: [36.8219, -1.2921], type: "therapy", country: "All" }, // Nairobi, Kenya
  { coordinates: [3.3792, 6.5244], type: "support", country: "All" }, // Lagos, Nigeria
  { coordinates: [39.2083, -6.7924], type: "wellness", country: "All" }, // Dar es Salaam, Tanzania
  { coordinates: [55.2708, 25.2048], type: "crisis", country: "All" }, // Dubai, UAE
  { coordinates: [51.3890, 35.6892], type: "therapy", country: "All" }, // Tehran, Iran
  { coordinates: [67.0011, 24.8607], type: "support", country: "All" }, // Karachi, Pakistan
  { coordinates: [90.4125, 23.8103], type: "wellness", country: "All" }, // Dhaka, Bangladesh
  { coordinates: [105.8342, 21.0285], type: "crisis", country: "All" }, // Hanoi, Vietnam
  { coordinates: [106.6297, 10.8231], type: "therapy", country: "All" }, // Ho Chi Minh City, Vietnam
  { coordinates: [101.6869, 3.1390], type: "support", country: "All" }, // Kuala Lumpur, Malaysia
  { coordinates: [174.7633, -36.8485], type: "wellness", country: "All" }, // Auckland, New Zealand
  { coordinates: [5.3721, 43.2965], type: "crisis", country: "All" }, // Marseille, France
  { coordinates: [8.2275, 46.8182], type: "therapy", country: "All" }, // Zurich, Switzerland
  { coordinates: [10.7522, 59.9139], type: "support", country: "All" }, // Oslo, Norway
  { coordinates: [18.0686, 59.3293], type: "wellness", country: "All" }, // Stockholm, Sweden
  { coordinates: [12.5674, 55.6759], type: "crisis", country: "All" }, // Copenhagen, Denmark
  { coordinates: [4.9041, 52.3676], type: "therapy", country: "All" }, // Amsterdam, Netherlands
  { coordinates: [4.3517, 50.8503], type: "support", country: "All" }, // Brussels, Belgium
  { coordinates: [6.1432, 46.2044], type: "wellness", country: "All" }, // Geneva, Switzerland
  { coordinates: [14.4378, 50.0755], type: "crisis", country: "All" }, // Prague, Czech Republic
  { coordinates: [19.0402, 47.4979], type: "therapy", country: "All" }, // Budapest, Hungary
  { coordinates: [21.0122, 52.2298], type: "support", country: "All" }, // Warsaw, Poland
];
