'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "1) Will the workshops also be available for the online participants?",
    answer: "Yes, we will do our best to make sure that the workshops are also available for the online participants, and make any code available to online participants for the duration of the week of the workshop. I think there was a past version of the website that stated that only lectures would be available to online participants, but we realized that there was more interest than we anticipated and our in-person venue probably did not have the space for everyone that wanted to fully participate in the event."
  },
  {
    question: "2) Will the workshops and lectures be recorded? I might not be able to attend synchronously due to [other commitment/time zone difference]?",
    answer: "The lectures will be recorded and be made available for all of the registrants of the workshop during and after the event. We can only promise that the hands-on workshops of the event will be fully functional for the duration of the workshop as we cannot make computational resources available indefinitely but it is likely we can provide code or notebooks that can be followed along asynchronously for those that may have other commitments or time zone differences. The exception to this will be the Nvidia workshop event, as the GPU hours they are providing might only be accessible during the time the workshop is being conducted. If anything changes about this, we will let you know. The panel and networking events will only be for in-person attendants, as those types of events are very difficult to execute in a satisfactory manner in an online setting in our opinion."
  },
  {
    question: "3) Can I switch tracks mid workshop? I know some of the stuff that is discussed the first day or two of the beginner track, but I am less familiar with the content towards the end.",
    answer: "We will not be policing attendance of the workshop or force people to go to one track or another. If you believe it is more beneficial to switch to the beginner or advanced track for a particular talk or workshop, we will not stop you from doing so. However, we have tried to structure the workshop and coordinate between speakers so that each session can build upon the last. Thus, we believe that it is probably more beneficial for you to stick to one track. It is highly likely we will try to host a larger scale version of this event next year that can accommodate more people in person (and iron out any technical issues that may pop up for the virtual version of the workshop this year), so if you are only able to attend the beginner track this year, you can come back next year to attend the advanced track."
  },
  {
    question: "4) I noticed the in-person registration closed, can I still sign up in-person?",
    answer: "We really appreciate your interest but unfortunately, our venue likely cannot support more people in-person without creating a fire hazard. If you registered for the virtual version and sent us an email to switch to the in-person version before May 2, and we missed your email by mistake, we will double check to see if there were any cancellations. It is highly likely we will try to host a larger scale version of this event next year that can accommodate more people in person (and iron out any technical issues that may pop up for the virtual version of the workshop this year). We apologize if this causes any inconvenience, but we hope we can make the virtual version of the workshop a super awesome experience for those that attend!"
  },
//   {
//     question: "5) Squarespace still displays 'payment pending'. Did my payment go through? Am I registered for the workshop?",
//     answer: "Yes, we have received your payment. Squarespace is just being strange. For some reason it displays this for everyone."
//   },
  {
    question: "5) Will there be a certificate for completion of the workshop?",
    answer: "We can provide a certificate of workshop attendance signed by the organizers upon reasonable request."
  },
  {
    question: "6) There are significant barriers that prevent me from paying for the workshop. Can I have a fee waiver?",
    answer: "Email quantum.ucla@gmail.com with your resume/CV and provide the reason for why it is difficult for you to pay the workshop fee. We will get back to you as soon as we can."
  }
];

interface Hotel {
  name: string;
  image: string;
  price: string;
  directions: string[];
  address: string;
  phone: string[];
  email?: string;
  website: string;
}

const hotels: Hotel[] = [
  {
    name: "UCLA Meyer & Luskin Hotel",
    image: "/images/luskin.png",
    price: "~$400 per night",
    directions: ["Across the Street from Engineering IV"],
    address: "425 Westwood Plaza, Los Angeles, CA 90095",
    phone: ["+1 (855) 522-8252"],
    email: "LCC@ha.ucla.edu",
    website: "https://luskinconferencecenter.ucla.edu/"
  },
  {
    name: "The Inn at UCLA",
    image: "/images/the_inn.png",
    price: "~$250 to $300",
    directions: ["14 minutes walking"],
    address: "330 Charles E Young Dr E, Los Angeles, CA 90024",
    phone: ["+1 (310) 825-2923"],
    email: "theinn@ha.ucla.edu",
    website: "https://guesthouse.ucla.edu/"
  },
  {
    name: "Hotel Angeleno",
    image: "/images/hotel_angeleno.png",
    price: "~$250 to $300",
    directions: [
      "Total time: ~21 minutes",
      "Take Bus Route 233 towards Expo/Sepulveda at Church/405 Fwy Off-Ramp",
      "Get off at Hilgard/Westholme",
      "Walk 9 minute walk to Engineering IV"
    ],
    address: "170 N Church Ln, Los Angeles, CA 90049",
    phone: ["+1 (310) 476-6411 (General Hotel)", "+1 (510) 986-8007 (Reservations)"],
    website: "https://www.hotelangeleno.com/"
  },
  {
    name: "Royal Palace Westwood Hotel",
    image: "/images/royal_place.png",
    price: "~$200 to $250",
    directions: ["16 minute walk to Engineering IV"],
    address: "1052 Tiverton Ave, Los Angeles, CA 90024",
    phone: ["+1 (310) 208-6677"],
    email: "royalpalacewestwood@earthlink.net",
    website: "https://www.royalpalacewestwood.com/"
  }
];

interface Restaurant {
  name: string;
  type: string;
  location: string;
}

const westwoodRestaurants: Restaurant[] = [
  { name: "The Broxton", type: "Tacos, Burgers, Beer, Dinner Plates", location: "1099 Westwood Blvd, Los Angeles, CA 90024" },
  { name: "Danny Boy's Pizza", type: "Also Offers Vegan Pizza Options", location: "10889 Lindbrook Dr, Los Angeles, CA 90024" },
  { name: "Mr. Noodle", type: "Asian Noodle Dishes, Vegetarian Friendly", location: "936 Broxton Ave, Los Angeles, CA 90024" },
  { name: "Mr. Rice", type: "Chinese Rice Bowls and Rice Noodle Dishes", location: "1010 Broxton Ave, Los Angeles, CA 90024" },
  { name: "In-and-Out Burger", type: "", location: "922 Gayley Ave, Los Angeles, CA 90024" },
  { name: "Kazunori", type: "Sushi and Handrolls", location: "1110 Gayley Ave, Los Angeles, CA 90024" },
  { name: "Bruxie", type: "Fried Chicken and Waffles", location: "1114 Gayley Ave, Los Angeles, CA 90024" },
  { name: "Fresh Corn Grill", type: "Salad and Pasta", location: "1266 Westwood Blvd, Los Angeles, CA 90024" },
  { name: "Nuka Cafe", type: "Turkish Food", location: "1510 Westwood Blvd, Los Angeles, CA 90024" },
  { name: "Qin West Noodle", type: "Chinese Noodle Dishes", location: "1767 Westwood Blvd, Los Angeles, CA 90025" },
  { name: "Tulsi", type: "Indian Food", location: "10916 Lindbrook Dr, Los Angeles, CA 90024" },
  { name: "Le Pain Quotidien", type: "Belgian Cafe", location: "1122 Gayley Ave, Los Angeles, CA 90024" },
  { name: "Elysee cafe", type: "Parisian Cafe", location: "1099 Gayley Ave, Los Angeles, CA 90024" },
  { name: "Ministry of Coffee", type: "Australian Coffee Shop", location: "1010 Glendon Ave, Los Angeles, CA 90024" },
  { name: "Bluestone Lane", type: "Coffee Shop", location: "950 Westwood Blvd, Los Angeles, CA 90024" },
  { name: "Junbi", type: "Matcha", location: "10967 Weyburn Ave, Los Angeles, CA 90024" },
  { name: "Sharetea", type: "Boba/Bubble Tea", location: "1055 Broxton Ave, Los Angeles, CA 90024" },
  { name: "Le Phant Milk Tea co", type: "Boba/Bubble Tea", location: "10911 Lindbrook Dr, Los Angeles, CA 90024" },
  { name: "Saffron and Rose", type: "Persian Ice Cream", location: "1387 Westwood Blvd, Los Angeles, CA 90024" },
  { name: "Tacos 1986", type: "", location: "10874 Kinross Ave, Los Angeles, CA 90024" },
  { name: "Noah's NY Bagels", type: "", location: "10910 Lindbrook Dr, Los Angeles, CA 90024" }
];

export default function QDW2026FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black pt-20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-4xl md:text-4xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We apologize if we have been a little slow at answering some of the questions that have come to our email. There has been a relatively high volume of questions that have come in. However, there have been a few frequently asked questions that we hope this page can address.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
                >
                  <span className="text-white font-medium pr-4">{item.question}</span>
                  <svg
                    className={`w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Travel to UCLA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
              Travel to UCLA
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {/* From LAX */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/royce_hall.png"
                      alt="UCLA Royce Hall"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    From LAX (adopted from{' '}
                    <a href="https://transportation.ucla.edu" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      UCLA Transportation
                    </a>
                    ):
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-gray-800">Public transit (around 1 hour, requires 1$ cash or coins)</p>
                      <ul className="text-gray-600 ml-4 mt-2 space-y-1 list-disc">
                        <li>Exit the terminal on the Lower/Arrivals level</li>
                        <li>Near the pink LAX Shuttle sign, board the LAX City Bus Center shuttle</li>
                        <li>From the Bus Center, locate the Culver CityBus Line 6 or Rapid 6
                          <ul className="ml-4 mt-1">
                            <li>
                              <a href="https://www.culvercity.org/Services/Transportation/Culver-CityBus/Routes-Schedules" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                Rough schedule
                              </a>
                            </li>
                          </ul>
                        </li>
                        <li>Disembark at the Gateway Plaza, which is the last stop</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Private ride services (around 30 minutes)</p>
                      <ul className="text-gray-600 ml-4 mt-2 space-y-1 list-disc">
                        <li>Exit the Lower/Arrivals level and take the LAX-it shuttle near the green LAX-it sign</li>
                        <li>Request your ride to UCLA via the app of your desired service</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* From BUR and Parking */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">From BUR:</h3>
                  <ul className="text-gray-600 ml-4 space-y-1 list-disc">
                    <li>
                      The rideshare pick-up, taxi pick-up, and shuttle pick-up locations can be found on the{' '}
                      <a href="https://hollywoodburbankairport.com/ground-transportation/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        official site
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src="/images/overview_of_la.png"
                        alt="Overview of LA"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Parking at UCLA</h3>
                    <ul className="text-gray-600 ml-4 space-y-2 list-disc">
                      <li>
                        Refer to:{' '}
                        <a href="https://transportation.ucla.edu/campus-parking/visitors" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          https://transportation.ucla.edu/campus-parking/visitors
                        </a>
                      </li>
                      <li>Parking Structure 8 ($16/day): 501 Westwood Plaza, Los Angeles, CA 90095</li>
                      <li>Parking Structure 2 ($16/day): 719 Hilgard Ave, Los Angeles, CA 90024</li>
                      <li>Parking Structure 4 ($16/day): 221 Westwood Plaza, Los Angeles, CA 90095</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Accommodation Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12 underline">
              Accommodation
            </h2>
            
            <div className="space-y-12">
              {hotels.map((hotel, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-start`}
                >
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={hotel.image}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{hotel.name}</h3>
                    <ul className="text-gray-600 space-y-2 list-disc ml-4">
                      <li><span className="font-semibold">Approximate Price:</span> {hotel.price}</li>
                      <li>
                        <span className="font-semibold">Distance/Directions to Venue:</span>
                        <ul className="ml-4 mt-1 list-disc">
                          {hotel.directions.map((dir, dirIndex) => (
                            <li key={dirIndex}>{dir}</li>
                          ))}
                        </ul>
                      </li>
                      <li><span className="font-semibold">Address:</span> {hotel.address}</li>
                      {hotel.phone.map((phone, phoneIndex) => (
                        <li key={phoneIndex}><span className="font-semibold">Phone Number:</span> {phone}</li>
                      ))}
                      {hotel.email && (
                        <li>
                          <span className="font-semibold">Email:</span>{' '}
                          <a href={`mailto:${hotel.email}`} className="text-purple-600 hover:underline">{hotel.email}</a>
                        </li>
                      )}
                      <li>
                        <span className="font-semibold">Website:</span>{' '}
                        <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          {hotel.website}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12 underline">
              Restaurants
            </h2>

            {/* On UCLA Campus */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">On UCLA Campus</h3>
                  <div className="text-gray-600">
                    <p className="font-semibold mb-2">ASUCLA Restaurants (Dispersed Throughout Campus)</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        Link:{' '}
                        <a href="https://www.asucla.edu/locations" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          https://www.asucla.edu/locations
                        </a>
                      </li>
                      <li>Host Recommendation: Epicuria (Italian Food)</li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/pizza.png"
                      alt="Pizza"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* In Westwood */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">In Westwood</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ul className="text-gray-600 space-y-3">
                    {westwoodRestaurants.slice(0, 11).map((restaurant, index) => (
                      <li key={index} className="list-disc ml-4">
                        <span className="font-semibold">{restaurant.name}</span>
                        {restaurant.type && <span> ({restaurant.type})</span>}
                        <br />
                        <span className="text-sm">Location: {restaurant.location}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="space-y-4 mb-6 flex justify-end">
                    <div className="relative w-3/4 aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src="/images/sushi.png"
                        alt="Sushi"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <ul className="text-gray-600 space-y-3">
                    {westwoodRestaurants.slice(11).map((restaurant, index) => (
                      <li key={index} className="list-disc ml-4">
                        <span className="font-semibold">{restaurant.name}</span>
                        {restaurant.type && <span> ({restaurant.type})</span>}
                        <br />
                        <span className="text-sm">Location: {restaurant.location}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-32 mt-12">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/noodles.png"
                    alt="Noodles"
                    fill
                    className="object-cover"
                  />
                </div>
                <div></div>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/dessert.png"
                    alt="Dessert"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* In West LA */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">In West LA</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Restaurants on Sawtelle Blvd</p>
                    <ul className="text-gray-600 list-disc ml-4">
                      <li>
                        <span className="font-semibold">Host Recommendations:</span> Odd One Out Boba, Sunright Boba, Tsujita LA, Tsujita Killer Noodle, Daikokuya, Marugame Udon, Millet Crepe, Tiga Wok, Tatsu Ramen, Chinchikurin, Anzu, Sonoritas Prime Tacos, Brothers Cousins Taco Truck, etc.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Century City Mall</p>
                    <ul className="text-gray-600 list-disc ml-4 space-y-1">
                      <li>
                        <span className="font-semibold">Link:</span>{' '}
                        <a href="https://www.westfield.com/en/united-states/centurycity/restaurants" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          https://www.westfield.com/en/united-states/centurycity/restaurants
                        </a>
                      </li>
                      <li>
                        <span className="font-semibold">Host Recommendations:</span> Hai Di Lao, Eataly, Mei Zhou Dong Po, 85 Degrees Bakery and Cafe, Wushiland, Redstraw Tea Bar, Ramen Nagi, Bacio Di Latte, etc.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/latte.png"
                      alt="Latte"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Info Button */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/qdw/2026/info"
            className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-full px-8 py-4 text-lg shadow-2xl transition-transform duration-200 hover:scale-[1.03]"
          >
            Back to QDW 2026 Info
          </Link>
        </div>
      </section>

      {/* Footer - Same as QDW */}
      <footer className="bg-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left side - Social icons */}
            <div className="flex items-center gap-6">
              {/* GitHub */}
              <a
                href="https://github.com/qcsa-at-ucla/qdc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>

            {/* Right side - Logo and text */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-xl p-2">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/quantum_device_chip.png"
                    alt="Quantum Device Workshop"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-white font-semibold text-lg leading-tight">
                Quantum<br />Device<br />Workshop
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
