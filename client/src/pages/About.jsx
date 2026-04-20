import React from 'react'
import { Link } from "react-router-dom";


export default function About() {
  return (
    <div className="max-w-2xl py-8 font-sans mx-auto">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
            Our story
        </p>

        <h1 className="text-3xl font-medium text-gray-900 mb-6 leading-snug">
            Welcome to Aisle Earthlings
        </h1>

        <p className="text-base leading-relaxed text-gray-800 mb-5">
            As an avid traveler and dedicated vegan, I've always found grocery shopping to be more of a mission than it should be. Hunting down my favoite brand of vegan cheese , tracking down high-protein tofu, or figuring out which store actually stocks the staples I need — it all adds up to way more time than I'd like to spend.
        </p>

        <p className="text-base leading-relaxed text-gray-800 mb-5">
            I built Aisle Earthlings to give that time back — to myself and to everyone else navigating the same thing. Enter your zip code and instantly see stores near you alongside the vegan items they carry. No more guesswork, no more wasted time.
        </p>

        {/* Compare Feature Highlight */}
        <div className="border border-green-200 bg-green-50 rounded-xl p-6 my-8">
            <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 text-lg">⚡</span>
            <p className="text-sm font-medium tracking-widest text-green-600 uppercase">
                Why Aisle Earthlings is different
            </p>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-3">
            Compare multiple stores at once — finally.
            </h2>

            <p className="text-base leading-relaxed text-gray-700 mb-5">
            If you've used other grocery apps, you know the drill: open a store, search "vegan," scroll through results, go back, open the next store, repeat. It's exhausting and defeats the whole purpose of saving time.
            </p>

            <p className="text-base leading-relaxed text-gray-700 mb-6">
            Aisle Earthlings' Compare page flips that on its head. Search multiple stores simultaneously and see everything side by side — product availability and pricing laid out clearly so you can make the call in seconds, not minutes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-green-100 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">No more tab hopping</p>
                <p className="text-xs leading-relaxed text-gray-500">
                All your stores and their vegan inventory in one view.
                </p>
            </div>
            <div className="bg-white border border-green-100 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Price clarity</p>
                <p className="text-xs leading-relaxed text-gray-500">
                See who has the better deal at a glance.
                </p>
            </div>
            <div className="bg-white border border-green-100 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Stock at a glance</p>
                <p className="text-xs leading-relaxed text-gray-500">
                Know exactly which store carries what before you leave home.
                </p>
            </div>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="border-l-2 border-gray-300 pl-5 pr-4 py-4 my-6 bg-gray-50 rounded-r-lg">
            <p className="text-sm font-medium text-gray-900 mb-1">A quick note on accuracy</p>
            <p className="text-sm leading-relaxed text-gray-500">
            Most vegans know that not everything tagged "vegan" in a search is always 100% vegan. We've done our best to surface purely plant-based products, but some items do slip through the filter. We always recommend double-checking — nutrition fact photos are included on every item, and there's a built-in Gemini vegan food reviewer button to help you verify anything you're unsure about.
            </p>
        </div>
        <div className="flex items-center justify-center my-10 bg-green-700 text-white rounded-lg py-4 border-yellow-100 border-2 shadow-lg">
            <button><Link to='/' ><h1 className='font-bold tracking-[0.20em]'>Login or Create Account</h1></Link></button>
        </div>

        <p className="text-base leading-relaxed text-gray-800">
            Happy shopping — and welcome to the earthlings aisle. 🌱
        </p>
    </div>
  )
}
