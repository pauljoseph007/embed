const statesCities = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Rajahmundry", "Tirupati", "Anantapur", "Kadapa", "Eluru",
    "Machilipatnam", "Chittoor", "Ongole", "Srikakulam", "Vizianagaram",
    "Amaravati", "Proddatur", "Tenali", "Adoni", "Nandyal"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro",
    "Bomdila", "Along", "Roing", "Tezu", "Khonsa",
    "Changlang", "Seppa", "Yingkiong", "Daporijo", "Aalo",
    "Anini", "Namsai", "Dirang", "Hayuliang", "Mechuka"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur",
    "Tinsukia", "Nagaon", "Bongaigaon", "Karimganj", "Goalpara",
    "Dhubri", "Lakhimpur", "Diphu", "Hailakandi", "Barpeta",
    "Kokrajhar", "Sivasagar", "Mariani", "North Lakhimpur", "Haflong"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
    "Purnia", "Arrah", "Begusarai", "Katihar", "Munger",
    "Chhapra", "Danapur", "Saharsa", "Hajipur", "Bettiah",
    "Motihari", "Siwan", "Sitamarhi", "Dehri", "Sasaram"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg",
    "Jagdalpur", "Ambikapur", "Rajnandgaon", "Raigarh", "Dhamtari",
    "Mahasamund", "Kanker", "Kawardha", "Surguja", "Janjgir",
    "Balod", "Bijapur", "Dantewada", "Mungeli", "Sukma"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Curchorem", "Bicholim", "Canacona", "Quepem", "Sanquelim",
    "Valpoi", "Sanguem", "Tivim", "Calangute", "Colva",
    "Anjuna", "Siolim", "Aldona", "Chicalim", "Cuncolim"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad",
    "Morbi", "Surendranagar", "Porbandar", "Navsari", "Valsad",
    "Bharuch", "Mehsana", "Godhra", "Patan", "Amreli"
  ],
  "Haryana": [
    "Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula",
    "Bhiwani", "Sirsa", "Jind", "Kaithal", "Rewari",
    "Bahadurgarh", "Palwal", "Kurukshetra", "Mahendragarh", "Narnaul"
  ],
  "Himachal Pradesh": [
    "Shimla", "Solan", "Dharamshala", "Mandi", "Bilaspur",
    "Kullu", "Chamba", "Una", "Nahan", "Palampur",
    "Hamirpur", "Kangra", "Sundarnagar", "Baddi", "Parwanoo",
    "Keylong", "Rampur", "Nurpur", "Dalhousie", "Jawalamukhi"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
    "Deoghar", "Phusro", "Giridih", "Ramgarh", "Medininagar",
    "Chirkunda", "Godda", "Gumia", "Chaibasa", "Sahibganj",
    "Simdega", "Jamtara", "Pakur", "Latehar", "Koderma"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi",
    "Shivamogga", "Tumakuru", "Ballari", "Davangere", "Raichur",
    "Hassan", "Bidar", "Hospet", "Chitradurga", "Udupi",
    "Chikmagalur", "Mandya", "Bagalkot", "Gadag", "Kolar"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur",
    "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam",
    "Pathanamthitta", "Idukki", "Manjeri", "Payyanur", "Varkala",
    "Punalur", "Neyyattinkara", "Adoor", "Perumbavoor", "Muvattupuzha"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Murwara", "Burhanpur", "Khandwa", "Bhind", "Chhindwara",
    "Guna", "Shivpuri", "Mandsaur", "Neemuch", "Sehore"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik",
    "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli",
    "Jalgaon", "Akola", "Latur", "Dhule", "Chandrapur",
    "Parbhani", "Ahmednagar", "Satara", "Beed", "Wardha"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Kakching", "Ukhrul",
    "Senapati", "Churachandpur", "Jiribam", "Tamenglong", "Moreh",
    "Lilong", "Kangpokpi", "Moirang", "Noney", "Andro",
    "Oinam", "Karong", "Mao", "Kumbi", "Nambol"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara",
    "Williamnagar", "Resubelpara", "Mairang", "Cherrapunji", "Mawkyrwat",
    "Nongpoh", "Khliehriat", "Ranikor", "Sohra", "Ampati",
    "Umsning", "Smit", "Pynursla", "Nartiang", "Mawphlang"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip",
    "Saiha", "Lawngtlai", "Mamit", "North Vanlaiphai", "Biate",
    "Sairang", "Sialsuk", "Khawzawl", "Zawlnuam", "N. Vanlaiphai",
    "Tuipang", "Thingsulthliah", "Phullen", "Thenzawl", "Darlawn"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Mon",
    "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng",
    "Chumukedima", "Tuli", "Meluri", "Pfutsero", "Noklak",
    "Changtongya", "Satakha", "Tamlu", "Aboi", "Shamator"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur",
    "Balasore", "Baripada", "Bhadrak", "Jharsuguda", "Jeypore",
    "Kendrapara", "Rayagada", "Angul", "Paradip", "Bargarh",
    "Phulbani", "Koraput", "Sonepur", "Nayagarh", "Puri"
  ],
  "Punjab": [
    "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar",
    "Khanna", "Phagwara", "Kapurthala", "Faridkot", "Sangrur",
    "Barnala", "Rupnagar", "Firozpur", "Muktsar", "Gurdaspur"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer",
    "Bikaner", "Alwar", "Sikar", "Bhilwara", "Pali",
    "Tonk", "Chittorgarh", "Barmer", "Jhunjhunu", "Nagaur",
    "Hanumangarh", "Dausa", "Banswara", "Jaisalmer", "Bundi"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo",
    "Jorethang", "Singtam", "Ravangla", "Soreng", "Chungthang",
    "Lachung", "Lachen", "Rhenock", "Dzongu", "Dentam",
    "Singtam", "Yangang", "Zuluk", "Kabi", "Tumin"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Erode", "Vellore", "Thoothukudi", "Tirunelveli", "Dindigul",
    "Thanjavur", "Cuddalore", "Kanchipuram", "Nagapattinam", "Karur",
    "Nagercoil", "Pudukkottai", "Sivakasi", "Virudhunagar", "Ariyalur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar",
    "Mahbubnagar", "Adilabad", "Ramagundam", "Suryapet", "Miryalaguda",
    "Jagtial", "Mancherial", "Siddipet", "Nalgonda", "Kamareddy",
    "Medak", "Kothagudem", "Zaheerabad", "Wanaparthy", "Vikarabad"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Kailashahar", "Dharmanagar", "Belonia",
    "Khowai", "Teliamura", "Ambassa", "Sonamura", "Amarpur",
    "Bishalgarh", "Sabroom", "Melaghar", "Ranirbazar", "Kamalpur",
    "Panisagar", "Mohanpur", "Gakulnagar", "Jirania", "Gandhigram"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj",
    "Ghaziabad", "Noida", "Meerut", "Bareilly", "Aligarh",
    "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Mathura",
    "Firozabad", "Ayodhya", "Shahjahanpur", "Rampur", "Bijnor"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee",
    "Kashipur", "Rudrapur", "Nainital", "Pauri", "Tehri",
    "Almora", "Pithoragarh", "Bageshwar", "Champawat", "Kotdwar",
    "Mussoorie", "Joshimath", "Devprayag", "Srinagar", "Ranikhet"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Malda", "Kharagpur", "Haldia", "Jalpaiguri",
    "Bankura", "Raiganj", "Cooch Behar", "Krishnanagar", "Midnapore",
    "Alipurduar", "Chinsurah", "Bally", "Serampore", "Raniganj"
  ]
};

export default statesCities;
