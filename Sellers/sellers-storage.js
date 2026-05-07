/* ═══════════════════════════════════════════════════════
   FarmDirect Sellers – LocalStorage Manager
   ═══════════════════════════════════════════════════════ */

(function() {
  var STORAGE_KEY = 'farmdirect_sellers';

  /* ── DEFAULT DATA (zero-state for new users) ── */
  function defaultData() {
    return {
      profile: {
        name: 'Juan Dela Cruz',
        avatar: null,
        role: 'Verified Farmer',
        member: 'Silver Member',
        followers: 52,
        following: 12
      },
      settings: {
        firstname: 'Juan',
        lastname: 'Dela Cruz',
        suffix: '',
        brgy: 'San Roque',
        city: 'Zamboanga City',
        province: 'Zamboanga del Sur',
        postal: '7000',
        storeName: "Juan's Fresh Produce",
        storeDesc: 'Fresh, local, and affordable produce from our farm to your table.',
        phone: '+63 912 345 6789',
        email: 'juan@farmdirect.ph',
        fbPage: '',
        tiktok: ''
      },
      toRateOrders: [
        {id:'FD-00230',name:'Organic Ginger (500g)',seller:'Green Valley Farm',img:'https://images.unsplash.com/photo-1590865101275-4d99c14856cc?w=100',total:'₱45.00',delivered:'Feb 28, 2026'},
        {id:'FD-00227',name:'Fresh Tomatoes (1 kg)',seller:"Rianne's Farm",img:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100',total:'₱95.00',delivered:'Feb 25, 2026'}
      ],
      myRatings: [
        {name:'Fresh Carrots (1 kg)',seller:"Rianne's Farm",img:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100',stars:5,text:'Super fresh and crisp! Great quality for cooking. Will order again.',date:'Feb 15, 2026'},
        {name:'Native Potatoes (2 kg)',seller:'Green Valley Farm',img:'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=100',stars:4,text:'Good quality but some were a bit small. Still fresh and tasty.',date:'Feb 10, 2026'},
        {name:'Fresh Cabbage (1 kg)',seller:"Maria's Garden",img:'https://images.unsplash.com/photo-1566385101042-1a0aa0c12e8c?w=100',stars:5,text:'Perfect for sinigang! Very fresh and clean.',date:'Feb 5, 2026'}
      ],
      vouchers: [
        {icon:'🎁',name:'New Farmer Welcome',code:'WELCOME50',expiry:'Apr 1, 2026',value:'₱50 OFF',min:'₱200'},
        {icon:'🍅',name:'Tomato Lovers Deal',code:'TOMATO30',expiry:'Mar 20, 2026',value:'₱30 OFF',min:'₱100'},
        {icon:'📦',name:'Bulk Purchase Bonus',code:'BULK100',expiry:'May 15, 2026',value:'₱100 OFF',min:'₱500'}
      ],
      stock: [
        {id:'tomatoes',name:'Fresh Tomatoes',category:'Vegetables',em:'🍅',
         img:'IMG/Tomatoes.jpg',imgFallback:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
         unitTypes:[
           {key:'kg',label:'Per Kg',price:35,alertAt:5,status:'live',
            batches:[{id:1,qty:4,sourceDate:'2026-03-27',expiry:'2026-04-03',addedOn:'2026-03-27'}]},
           {key:'bundle',label:'Per Bundle',price:80,alertAt:5,status:'live',
            batches:[{id:2,qty:8,sourceDate:'2026-03-26',expiry:'2026-04-04',addedOn:'2026-03-26'}]},
           {key:'box',label:'Per Box',price:150,alertAt:3,status:'live',
            batches:[{id:3,qty:3,sourceDate:'2026-03-28',expiry:'2026-04-05',addedOn:'2026-03-28'}]}
         ]},
        {id:'carrots',name:'Organic Carrots',category:'Vegetables',em:'🥕',
         img:'IMG/Carrots.jpg',imgFallback:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
         unitTypes:[
           {key:'kg',label:'Per Kg',price:30,alertAt:10,status:'live',
            batches:[{id:10,qty:12,sourceDate:'2026-03-25',expiry:'2026-04-18',addedOn:'2026-03-25'}]},
           {key:'bundle',label:'Per Bundle',price:60,alertAt:5,status:'live',
            batches:[{id:11,qty:6,sourceDate:'2026-03-26',expiry:'2026-04-19',addedOn:'2026-03-26'}]},
           {key:'box',label:'Per Box',price:120,alertAt:3,status:'live',
            batches:[{id:12,qty:4,sourceDate:'2026-03-27',expiry:'2026-04-20',addedOn:'2026-03-27'}]}
         ]},
        {id:'lettuce',name:'Fresh Lettuce',category:'Leafy Greens',em:'🥬',
         img:'IMG/Lettuce.jpg',imgFallback:'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400',
         unitTypes:[
           {key:'kg',label:'Per Kg',price:25,alertAt:10,status:'live',
            batches:[{id:20,qty:30,sourceDate:'2026-03-29',expiry:'2026-04-02',addedOn:'2026-03-29'}]},
           {key:'bundle',label:'Per Bundle',price:50,alertAt:5,status:'live',
            batches:[{id:21,qty:15,sourceDate:'2026-03-28',expiry:'2026-04-03',addedOn:'2026-03-28'}]},
           {key:'box',label:'Per Box',price:100,alertAt:3,status:'live',
            batches:[{id:22,qty:5,sourceDate:'2026-03-27',expiry:'2026-04-04',addedOn:'2026-03-27'}]}
         ]},
        {id:'corn',name:'Sweet Corn',category:'Grains',em:'🌽',
         img:'IMG/Corn.jpg',imgFallback:'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
         unitTypes:[
           {key:'kg',label:'Per Kg',price:20,alertAt:15,status:'live',
            batches:[{id:30,qty:55,sourceDate:'2026-03-28',expiry:'2026-04-07',addedOn:'2026-03-28'}]},
           {key:'bundle',label:'Per Bundle',price:45,alertAt:10,status:'live',
            batches:[{id:31,qty:20,sourceDate:'2026-03-27',expiry:'2026-04-08',addedOn:'2026-03-27'}]},
           {key:'box',label:'Per Box',price:90,alertAt:5,status:'live',
            batches:[{id:32,qty:8,sourceDate:'2026-03-26',expiry:'2026-04-09',addedOn:'2026-03-26'}]}
         ]},
        {id:'strawberries',name:'Strawberries',category:'Fruits',em:'🍓',
         img:'IMG/Strawberries.jpg',imgFallback:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
         unitTypes:[
           {key:'kg',label:'Per Kg',price:90,alertAt:5,status:'live',
            batches:[{id:40,qty:6,sourceDate:'2026-03-30',expiry:'2026-04-01',addedOn:'2026-03-30'}]},
           {key:'bundle',label:'Per Bundle',price:180,alertAt:3,status:'live',
            batches:[{id:41,qty:4,sourceDate:'2026-03-29',expiry:'2026-04-02',addedOn:'2026-03-29'}]},
           {key:'box',label:'Per Box',price:320,alertAt:2,status:'live',
            batches:[{id:42,qty:2,sourceDate:'2026-03-28',expiry:'2026-04-03',addedOn:'2026-03-28'}]}
         ]}
      ],
      products: [
        {id:'tomatoes',name:'Fresh Tomatoes',category:'Vegetables',price:35,unit:'kg',
         img:'IMG/Tomatoes.jpg',imgFallback:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
         desc:'Grown in Tugbungan, hand-picked every morning.',tags:'Organic,Harvested Daily,Tugbungan',
         stock:4,revenue:7560,sold:347,rating:4.8,reviews:89,status:'live'},
        {id:'carrots',name:'Organic Carrots',category:'Vegetables',price:30,unit:'kg',
         img:'IMG/Carrots.jpg',imgFallback:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
         desc:'Sweet and crunchy organic carrots.',tags:'Organic,Farm Fresh',
         stock:12,revenue:4320,sold:216,rating:4.6,reviews:54,status:'live'},
        {id:'lettuce',name:'Fresh Lettuce',category:'Leafy Greens',price:25,unit:'kg',
         img:'IMG/Lettuce.jpg',imgFallback:'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400',
         desc:'Crisp and fresh lettuce, perfect for salads.',tags:'Fresh,Leafy,Local',
         stock:30,revenue:3200,sold:128,rating:4.7,reviews:41,status:'live'}
      ],
       reports: [],
       reviews: [
         {id:1, product:'Fresh Lettuce',date:'Mar 5, 2026',stars:5,text:'Super fresh and well-packed! Will definitely order again from Rianne\'s Farm. Delivery was fast too!',customer:'Maria Santos',replied:true,reply:'Thank you so much, Maria! So happy you loved the lettuce. We always harvest fresh before packing. See you on your next order!'},
         {id:2, product:'Fresh Tomatoes',date:'Mar 3, 2026',stars:4,text:'Good quality tomatoes. A bit small compared to the photos but still fresh and tasty. Will try again.',customer:'Juan Enriquez',replied:true,reply:'Thanks for the honest feedback, Juan! We\'ll make sure to better match the product photos next time.'},
         {id:3, product:'Strawberries',date:'Mar 1, 2026',stars:5,text:'Best strawberries I\'ve bought online! So sweet and fresh — came in perfect condition. Highly recommend!',customer:'Ana Reyes',replied:true,reply:'That means the world to us, Ana! Our strawberries are handpicked at peak ripeness just for you.'},
         {id:4, product:'Organic Carrots',date:'Feb 28, 2026',stars:3,text:'Carrots were okay but I was expecting organic-certified ones. Packaging was neat and delivery was on time.',customer:'Carlos Bautista',replied:false,reply:''}
       ],
       orders: [
         {id:'ORD-00241',status:'delivered',product:'Fresh Tomatoes',qty:'2 kg',customer:'Maria Santos',address:'Lunzuran, Zamboanga City',amount:'₱380',payment:'GCash ✅ Paid',paymentRaw:'GCash',delivery:'🚶 Self Pickup',orderDate:'Mar 1, 2026 · 9:12 AM',deliveredOn:'Mar 1, 2026 · 1:45 PM',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Mar 1, 2026 · 9:12 AM',desc:'Maria Santos placed the order. GCash payment confirmed.'},{icon:'✅',done:true,title:'Order Confirmed',time:'Mar 1, 2026 · 9:30 AM',desc:'You confirmed the order and started preparation.'},{icon:'✅',done:true,title:'Preparing Order',time:'Mar 1, 2026 · 10:15 AM',desc:'Tomatoes harvested, sorted, and packed for pickup.'},{icon:'✅',done:true,title:'Ready for Pickup',time:'Mar 1, 2026 · 12:00 PM',desc:'Order packed and ready. Maria Santos was notified to pick up.'},{icon:'🏠',done:true,title:'Picked Up ✅',time:'Mar 1, 2026 · 1:45 PM',desc:'Maria Santos picked up the order. Confirmed complete.',last:true}],courier:{type:'pickup',name:'Maria Santos (Customer)',meta:'Picked up in person · Mar 1, 2026 · 1:45 PM',plate:'No rider needed — customer collected directly',phone:'+639000000000'}},
         {id:'ORD-00240',status:'pending',product:'Organic Carrots',qty:'1 kg',customer:'Juan dela Cruz',address:'Culianan, Zamboanga City',amount:'₱210',payment:'COD',paymentRaw:'COD',delivery:'🛵 Grab',orderDate:'Feb 28, 2026 · 10:45 AM',estDelivery:'Feb 28, 2026 · 2:30 PM',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Feb 28, 2026 · 10:45 AM',desc:'Juan dela Cruz placed the order. Payment: COD.'},{icon:'⏳',active:true,title:'Awaiting Farmer Confirmation',time:'Waiting since Feb 28, 2026 · 10:46 AM',desc:'Waiting for you to review and confirm before preparation begins.'},{icon:'📦',done:false,title:'Preparing Order',time:'Not started yet',desc:'Once confirmed, harvest and pack the produce for delivery.'},{icon:'🛵',done:false,title:'Out for Delivery (Grab)',time:'Not started yet',desc:'Grab rider will pick up from you and deliver to Juan dela Cruz.'},{icon:'🏠',done:false,title:'Delivered',time:'Not yet',desc:'Order will be marked delivered once customer confirms receipt.',last:true}]},
         {id:'ORD-00239',status:'processing',product:'Strawberries',qty:'5 boxes',customer:'Ana Reyes',address:'Guisao, Zamboanga City',amount:'₱450',payment:'GCash',paymentRaw:'GCash',delivery:'🏍️ Maxim',orderDate:'Mar 4, 2026 · 7:30 AM',estDelivery:'Mar 4, 2026 · 11:00 AM',partialCancel:true,timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Mar 4, 2026 · 7:30 AM',desc:'Ana Reyes placed the order. GCash payment confirmed.'},{icon:'✅',done:true,title:'Order Confirmed',time:'Mar 4, 2026 · 7:45 AM',desc:'You confirmed the order and selected 🏍️ Maxim for delivery.'},{icon:'🔄',active:true,title:'Preparing Order',time:'Started Mar 4, 2026 · 8:00 AM',desc:'Harvesting and packing 5 boxes of strawberries for Ana Reyes.',inProgress:true},{icon:'🏍️',done:false,title:'Out for Delivery (Maxim)',time:'Waiting for handoff',desc:'Once packed, click "Hand to Rider" and the Maxim rider will pick up.',id:'delivery'},{icon:'💰',done:false,title:'Payment Collection',time:'Pending delivery',desc:'Confirm payment received once the order is delivered to Ana Reyes.',id:'payment'},{icon:'🏠',done:false,title:'Order Complete',time:'Est. Mar 4, 2026 · 11:00 AM',desc:'Order marked complete after payment is confirmed.',last:true,id:'done'}]},
         {id:'ORD-00238',status:'delivered',product:'Fresh Lettuce',qty:'5 boxes',customer:'Carlos Bautista',address:'Guisao, Zamboanga City',amount:'₱200',payment:'GCash ✅ Paid',paymentRaw:'GCash',delivery:'🏍️ Maxim',orderDate:'Mar 5, 2026 · 8:00 AM',deliveredOn:'Mar 5, 2026 · 11:30 AM',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Mar 5, 2026 · 8:00 AM',desc:'Carlos Bautista placed the order. GCash payment confirmed.'},{icon:'✅',done:true,title:'Order Confirmed',time:'Mar 5, 2026 · 8:15 AM',desc:'You confirmed the order and started preparation.'},{icon:'✅',done:true,title:'Preparing Order',time:'Mar 5, 2026 · 9:00 AM',desc:'Lettuce harvested, sorted, and packed for delivery.'},{icon:'✅',done:true,title:'Out for Delivery (Maxim)',time:'Mar 5, 2026 · 10:00 AM',desc:'Maxim rider picked up and headed to Guisao.'},{icon:'🏠',done:true,title:'Delivered ✅',time:'Mar 5, 2026 · 11:30 AM',desc:'Carlos Bautista received the order. Delivery confirmed.',last:true}],courier:{type:'rider',service:'Maxim',name:'Pedro Santos',meta:'Maxim Rider · Zamboanga City',plate:'ZAM-5678',phone:'+639111111111'}},
         {id:'ORD-00237',status:'cancelled',product:'Sweet Corn',qty:'22 pieces',customer:'Liza Gomez',address:'Putik, Zamboanga City',amount:'₱440 — Refunded',payment:'PayMaya',paymentRaw:'PayMaya',delivery:'🛵 Grab',orderDate:'Mar 3, 2026 · 10:00 AM',cancelledOn:'Mar 3, 2026 · 11:15 AM',cancelReason:'Customer changed their mind',cancelMessage:'"Sorry po, nabili na ko ng mais sa palengke kanina. I\'ll order again next time."',cancelBy:'Liza Gomez (Customer)',cancelStage:'Before preparation started',cancelTime:'1 hour 15 minutes',refundStatus:'✅ ₱440 refunded via PayMaya',stockRestored:'✅ 22 pieces returned to stock',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Mar 3, 2026 · 10:00 AM',desc:'Liza Gomez placed the order. PayMaya payment confirmed.'},{icon:'❌',cancelled:true,title:'Order Cancelled',time:'Mar 3, 2026 · 11:15 AM',desc:'Liza Gomez cancelled the order before preparation began.'},{icon:'📦',void:true,title:'Preparing Order',time:'—',desc:'Did not proceed.'},{icon:'🛵',void:true,title:'Out for Delivery',time:'—',desc:'Did not proceed.'},{icon:'🏠',void:true,title:'Delivered',time:'—',desc:'Did not proceed.',last:true}]},
         {id:'ORD-00236',status:'delivered',product:'Fresh Lettuce',qty:'3 bundles',customer:'Bert Villanueva',address:'Sta. Maria, Zamboanga City',amount:'₱140',payment:'COD ✅ Paid',paymentRaw:'COD',delivery:'🛵 Grab',orderDate:'Mar 2, 2026 · 7:00 AM',deliveredOn:'Mar 2, 2026 · 10:30 AM',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Mar 2, 2026 · 7:00 AM',desc:'Bert Villanueva placed the order. Payment: COD.'},{icon:'✅',done:true,title:'Order Confirmed',time:'Mar 2, 2026 · 7:20 AM',desc:'You confirmed the order and started preparation.'},{icon:'✅',done:true,title:'Preparing Order',time:'Mar 2, 2026 · 7:55 AM',desc:'Lettuce harvested and packed for delivery.'},{icon:'✅',done:true,title:'Out for Delivery (Grab)',time:'Mar 2, 2026 · 9:00 AM',desc:'Grab rider picked up and headed to Sta. Maria.'},{icon:'🏠',done:true,title:'Delivered ✅',time:'Mar 2, 2026 · 10:30 AM',desc:'Bert Villanueva received the order. COD collected.',last:true}],courier:{type:'rider',service:'Grab',name:'Ronnie Dela Peña',meta:'Grab Rider · Zamboanga City',plate:'ZAM-3321',phone:'+639222222222'}},
         {id:'ORD-00235',status:'delivered',product:'Fresh Lettuce',qty:'4 bundles',customer:'Grace Tan',address:'Ipil, Zamboanga City',amount:'₱168',payment:'GCash ✅ Paid',paymentRaw:'GCash',delivery:'🏍️ Maxim',orderDate:'Mar 1, 2026 · 6:45 AM',deliveredOn:'Mar 1, 2026 · 9:30 AM',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Mar 1, 2026 · 6:45 AM',desc:'Grace Tan placed the order. GCash payment confirmed.'},{icon:'✅',done:true,title:'Order Confirmed',time:'Mar 1, 2026 · 7:00 AM',desc:'You confirmed the order and started preparation.'},{icon:'✅',done:true,title:'Preparing Order',time:'Mar 1, 2026 · 7:40 AM',desc:'Lettuce harvested and packed for delivery.'},{icon:'✅',done:true,title:'Out for Delivery (Maxim)',time:'Mar 1, 2026 · 8:15 AM',desc:'Maxim rider picked up and headed to Ipil.'},{icon:'🏠',done:true,title:'Delivered ✅',time:'Mar 1, 2026 · 9:30 AM',desc:'Grace Tan received the order. Delivery confirmed.',last:true}],courier:{type:'rider',service:'Maxim',name:'Jay Ramos',meta:'Maxim Rider · Zamboanga City',plate:'ZAM-8821',phone:'+639333333333'}},
         {id:'ORD-00234',status:'pending',product:'Sweet Corn',qty:'10 pieces',customer:'Ramon Cruz',address:'Cabaluay, Zamboanga City',amount:'₱220',payment:'COD',paymentRaw:'COD',delivery:'🚜 Farmer Delivery',orderDate:'Feb 27, 2026 · 9:00 AM',estDelivery:'Feb 27, 2026 · 1:00 PM',timeline:[{icon:'✅',done:true,title:'Order Placed',time:'Feb 27, 2026 · 9:00 AM',desc:'Ramon Cruz placed the order. Payment: COD.'},{icon:'⏳',active:true,title:'Awaiting Farmer Confirmation',time:'Waiting since Feb 27, 2026 · 9:01 AM',desc:'Waiting for you to review and confirm.'},{icon:'📦',done:false,title:'Preparing Order',time:'Not started yet',desc:'Once confirmed, harvest and pack the produce.'},{icon:'🛵',done:false,title:'Out for Delivery (Farmer Delivery)',time:'Not started yet',desc:'You will personally deliver this order to Ramon Cruz.'},{icon:'🏠',done:false,title:'Delivered',time:'Not yet',desc:'Order will be marked delivered once customer confirms receipt.',last:true}]}
       ],
       nextBatchId: 300
     };
  }

  /* ── CURRENT USER KEY ── */
  function currentUserKey() {
    return localStorage.getItem('farmdirect_current_user') || 'default';
  }
  function userStorageKey() {
    return STORAGE_KEY + '_' + currentUserKey();
  }

  /* ── SAVE / LOAD ── */
  function save(data) {
    try {
      localStorage.setItem(userStorageKey(), JSON.stringify(data));
    } catch(e) { console.warn('LocalStorage save failed:', e); }
  }

  function load() {
    try {
      var raw = localStorage.getItem(userStorageKey());
      if (raw) {
        var parsed = JSON.parse(raw);
        /* merge with defaults so new fields don't break old saves */
        var def = defaultData();
        for (var k in def) {
          if (!(k in parsed)) parsed[k] = def[k];
        }
        return parsed;
      }
    } catch(e) { console.warn('LocalStorage load failed:', e); }
    /* return a fresh copy */
    var fresh = defaultData();
    save(fresh);
    return fresh;
  }

  /* ── RESET (for logout / new user) ── */
  function reset() {
    var fresh = defaultData();
    save(fresh);
    return fresh;
  }

  /* ── SWITCH USER ── */
  function switchUser(username) {
    localStorage.setItem('farmdirect_current_user', username);
    var existing = load();
    /* if first time for this user, ensure saved */
    save(existing);
    return existing;
  }

  /* ── DELETE USER DATA ── */
  function deleteUser(username) {
    localStorage.removeItem(STORAGE_KEY + '_' + username);
  }

  /* ── EXPOSE TO WINDOW ── */
  window.FarmDirectStorage = {
    get: load,
    save: save,
    reset: reset,
    switchUser: switchUser,
    deleteUser: deleteUser,
    currentUserKey: currentUserKey,
    defaultData: defaultData
  };
})();
