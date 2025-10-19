import React from 'react'
import PageLoader from '../components/PageLoader'
const salonData = [
  {
    title: "Men's Premium Haircut",
    price: "৳500",
  },
  {
    title: "Men's Premium Haircut",
    price: "৳500",
    showButton: true,
  },
  {
    title: "Men's Premium Haircut",
    price: "৳500",
  },
  {
    title: "Men's Premium Haircut",
    price: "৳500",
    showButton: true,
  },
  {
    title: "Men's Premium Haircut",
    price: "৳500",
    showButton: true,
  },
  // ...other items
];

const HairCut = () => {
  return (
    <div>
        <PageLoader catalogItems={salonData} />
    </div>
  )
}

export default HairCut