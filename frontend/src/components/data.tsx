
interface MapPoint {
  coordinates: [number, number];
  type: "recovery" | "neutral" | "affected" | "safe";
  country: string;
}

export const data: MapPoint[] = [
  // USA - Major cities and regions
  { coordinates: [-74.006, 40.7128], type: "neutral", country: "USA" }, // New York
  { coordinates: [-118.2437, 34.0522], type: "safe", country: "USA" }, // Los Angeles
  { coordinates: [-87.6298, 41.8781], type: "affected", country: "USA" }, // Chicago
  { coordinates: [-95.3698, 29.7604], type: "recovery", country: "USA" }, // Houston
  { coordinates: [-75.1652, 39.9526], type: "neutral", country: "USA" }, // Philadelphia
  { coordinates: [-112.074, 33.4484], type: "safe", country: "USA" }, // Phoenix
  { coordinates: [-98.4936, 29.4241], type: "affected", country: "USA" }, // San Antonio
  { coordinates: [-117.1611, 32.7157], type: "recovery", country: "USA" }, // San Diego
  { coordinates: [-96.7970, 32.7767], type: "neutral", country: "USA" }, // Dallas
  { coordinates: [-121.4944, 38.5816], type: "safe", country: "USA" }, // Sacramento
  { coordinates: [-122.4194, 37.7749], type: "neutral", country: "USA" }, // San Francisco
  { coordinates: [-122.6765, 45.5152], type: "affected", country: "USA" }, // Portland
  { coordinates: [-71.0589, 42.3601], type: "recovery", country: "USA" }, // Boston
  { coordinates: [-83.0458, 42.3314], type: "neutral", country: "USA" }, // Detroit
  { coordinates: [-80.1918, 25.7617], type: "safe", country: "USA" }, // Miami
  { coordinates: [-104.9903, 39.7392], type: "affected", country: "USA" }, // Denver
  { coordinates: [-122.3321, 47.6062], type: "recovery", country: "USA" }, // Seattle
  { coordinates: [-77.0369, 38.9072], type: "neutral", country: "USA" }, // Washington DC
  { coordinates: [-84.3880, 33.7490], type: "safe", country: "USA" }, // Atlanta
  { coordinates: [-90.0715, 29.9511], type: "affected", country: "USA" }, // New Orleans

  // China - Major cities
  { coordinates: [116.4074, 39.9042], type: "neutral", country: "China" }, // Beijing
  { coordinates: [121.4737, 31.2304], type: "recovery", country: "China" }, // Shanghai
  { coordinates: [113.2644, 23.1291], type: "affected", country: "China" }, // Guangzhou
  { coordinates: [114.0579, 22.5431], type: "safe", country: "China" }, // Shenzhen
  { coordinates: [104.0668, 30.5728], type: "neutral", country: "China" }, // Chengdu
  { coordinates: [108.9480, 34.2588], type: "recovery", country: "China" }, // Xi'an
  { coordinates: [120.1614, 30.2936], type: "affected", country: "China" }, // Hangzhou
  { coordinates: [117.2692, 39.1439], type: "safe", country: "China" }, // Tianjin
  { coordinates: [106.5513, 29.5630], type: "neutral", country: "China" }, // Chongqing
  { coordinates: [118.7669, 32.0415], type: "recovery", country: "China" }, // Nanjing
  { coordinates: [114.2734, 30.5943], type: "affected", country: "China" }, // Wuhan
  { coordinates: [112.5387, 37.8957], type: "safe", country: "China" }, // Taiyuan

  // UK - Major cities
  { coordinates: [-0.1276, 51.5074], type: "affected", country: "UK" }, // London
  { coordinates: [-2.2426, 53.4808], type: "neutral", country: "UK" }, // Manchester
  { coordinates: [-2.9916, 53.4084], type: "recovery", country: "UK" }, // Liverpool
  { coordinates: [-1.8904, 52.4862], type: "safe", country: "UK" }, // Birmingham
  { coordinates: [-1.0873, 53.9588], type: "affected", country: "UK" }, // York
  { coordinates: [-3.1883, 55.9533], type: "neutral", country: "UK" }, // Edinburgh
  { coordinates: [-4.2518, 55.8642], type: "recovery", country: "UK" }, // Glasgow
  { coordinates: [-1.6131, 54.9783], type: "safe", country: "UK" }, // Newcastle
  { coordinates: [-2.5879, 51.4545], type: "affected", country: "UK" }, // Bristol
  { coordinates: [-1.2577, 51.7520], type: "neutral", country: "UK" }, // Oxford

  // Australia - Major cities
  { coordinates: [151.2093, -33.8688], type: "recovery", country: "Australia" }, // Sydney
  { coordinates: [144.9631, -37.8136], type: "safe", country: "Australia" }, // Melbourne
  { coordinates: [153.0251, -27.4698], type: "affected", country: "Australia" }, // Brisbane
  { coordinates: [138.6007, -34.9285], type: "neutral", country: "Australia" }, // Adelaide
  { coordinates: [115.8605, -31.9505], type: "recovery", country: "Australia" }, // Perth
  { coordinates: [147.1441, -42.8821], type: "safe", country: "Australia" }, // Hobart
  { coordinates: [149.1300, -35.2809], type: "affected", country: "Australia" }, // Canberra
  { coordinates: [130.8456, -12.4634], type: "neutral", country: "Australia" }, // Darwin

  // Botswana - Cities and regions
  { coordinates: [25.9066, -24.6282], type: "safe", country: "Botswana" }, // Gaborone
  { coordinates: [25.5082, -25.1653], type: "neutral", country: "Botswana" }, // Kanye
  { coordinates: [26.3123, -24.5450], type: "recovery", country: "Botswana" }, // Molepolole
  { coordinates: [27.4858, -21.1789], type: "affected", country: "Botswana" }, // Francistown
  { coordinates: [23.4265, -22.2312], type: "safe", country: "Botswana" }, // Maun
  { coordinates: [26.7918, -25.1445], type: "neutral", country: "Botswana" }, // Lobatse

  // Global cities for "All" category
  { coordinates: [2.3522, 48.8566], type: "safe", country: "All" }, // Paris, France
  { coordinates: [13.405, 52.52], type: "neutral", country: "All" }, // Berlin, Germany
  { coordinates: [12.4964, 41.9028], type: "recovery", country: "All" }, // Rome, Italy
  { coordinates: [-3.7037, 40.4165], type: "affected", country: "All" }, // Madrid, Spain
  { coordinates: [37.6173, 55.7558], type: "recovery", country: "All" }, // Moscow, Russia
  { coordinates: [139.6917, 35.6895], type: "affected", country: "All" }, // Tokyo, Japan
  { coordinates: [126.9780, 37.5665], type: "safe", country: "All" }, // Seoul, South Korea
  { coordinates: [77.2090, 28.6139], type: "neutral", country: "All" }, // New Delhi, India
  { coordinates: [72.8777, 19.0760], type: "recovery", country: "All" }, // Mumbai, India
  { coordinates: [103.8198, 1.3521], type: "affected", country: "All" }, // Singapore
  { coordinates: [100.5018, 13.7563], type: "safe", country: "All" }, // Bangkok, Thailand
  { coordinates: [106.8456, -6.2088], type: "neutral", country: "All" }, // Jakarta, Indonesia
  { coordinates: [121.5654, 25.0330], type: "recovery", country: "All" }, // Taipei, Taiwan
  { coordinates: [114.1694, 22.3193], type: "affected", country: "All" }, // Hong Kong
  { coordinates: [-46.6333, -23.5505], type: "safe", country: "All" }, // São Paulo, Brazil
  { coordinates: [-43.1729, -22.9068], type: "neutral", country: "All" }, // Rio de Janeiro, Brazil
  { coordinates: [-58.3816, -34.6037], type: "recovery", country: "All" }, // Buenos Aires, Argentina
  { coordinates: [-70.6693, -33.4489], type: "affected", country: "All" }, // Santiago, Chile
  { coordinates: [-99.1332, 19.4326], type: "safe", country: "All" }, // Mexico City, Mexico
  { coordinates: [31.2357, 30.0444], type: "neutral", country: "All" }, // Cairo, Egypt
  { coordinates: [18.4241, -33.9249], type: "recovery", country: "All" }, // Cape Town, South Africa
  { coordinates: [28.0473, -26.2041], type: "affected", country: "All" }, // Johannesburg, South Africa
  { coordinates: [36.8219, -1.2921], type: "safe", country: "All" }, // Nairobi, Kenya
  { coordinates: [3.3792, 6.5244], type: "neutral", country: "All" }, // Lagos, Nigeria
  { coordinates: [39.2083, -6.7924], type: "recovery", country: "All" }, // Dar es Salaam, Tanzania
  { coordinates: [55.2708, 25.2048], type: "affected", country: "All" }, // Dubai, UAE
  { coordinates: [51.3890, 35.6892], type: "safe", country: "All" }, // Tehran, Iran
  { coordinates: [67.0011, 24.8607], type: "neutral", country: "All" }, // Karachi, Pakistan
  { coordinates: [90.4125, 23.8103], type: "recovery", country: "All" }, // Dhaka, Bangladesh
  { coordinates: [105.8342, 21.0285], type: "affected", country: "All" }, // Hanoi, Vietnam
  { coordinates: [106.6297, 10.8231], type: "safe", country: "All" }, // Ho Chi Minh City, Vietnam
  { coordinates: [101.6869, 3.1390], type: "neutral", country: "All" }, // Kuala Lumpur, Malaysia
  { coordinates: [174.7633, -36.8485], type: "recovery", country: "All" }, // Auckland, New Zealand
  { coordinates: [5.3721, 43.2965], type: "affected", country: "All" }, // Marseille, France
  { coordinates: [8.2275, 46.8182], type: "safe", country: "All" }, // Zurich, Switzerland
  { coordinates: [10.7522, 59.9139], type: "neutral", country: "All" }, // Oslo, Norway
  { coordinates: [18.0686, 59.3293], type: "recovery", country: "All" }, // Stockholm, Sweden
  { coordinates: [12.5674, 55.6759], type: "affected", country: "All" }, // Copenhagen, Denmark
  { coordinates: [4.9041, 52.3676], type: "safe", country: "All" }, // Amsterdam, Netherlands
  { coordinates: [4.3517, 50.8503], type: "neutral", country: "All" }, // Brussels, Belgium
  { coordinates: [6.1432, 46.2044], type: "recovery", country: "All" }, // Geneva, Switzerland
  { coordinates: [14.4378, 50.0755], type: "affected", country: "All" }, // Prague, Czech Republic
  { coordinates: [19.0402, 47.4979], type: "safe", country: "All" }, // Budapest, Hungary
  { coordinates: [21.0122, 52.2298], type: "neutral", country: "All" }, // Warsaw, Poland
];
