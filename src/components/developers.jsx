import React from "react";
import { BackgroundGradientDemo } from "./dev-back";

// Individual Developer Component (example placeholder component)
// function BackgroundGradientDemo() {
//   return (
//     <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg shadow-lg text-white">
//       <div className="w-24 h-24 mb-4 rounded-full bg-gray-100" />
//       <h3 className="text-lg font-bold">Developer Name</h3>
//       <p className="text-sm text-gray-200">Role/Position</p>
//     </div>
//   );
// }

export default function Developers() {
  return (
    <section id="developers" className="py-20 px-6 mb-[10rem] bg-black">
      <div className="max-w-[75rem] mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-6 text-center">
          Meet the Developers
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
          We are a team of dedicated developers passionate about creating
          user-friendly applications and solving real-world problems. Learn more
          about us below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Render individual developer components */}
        <div className="items-center justify-center max-w-[30rem] max-h-[30rem] mb-10 mt-5">
          <BackgroundGradientDemo
            imgSrc="/devs/mohit.jpg"
            description="Mohit Mongia"
            githubLink="https://github.com/Mohit2005123"
            linkedinLink="https://www.linkedin.com/in/mongia-mohit/"
            instagramLink="https://www.instagram.com/mohit_mongia_2005/"
          />
        </div>
        <div className="items-center justify-center max-w-[30rem] max-h-[30rem] mb-10 mt-5">
          <BackgroundGradientDemo
            imgSrc="/devs/sparsh.png"
            description="Sparsh Gulati"
            githubLink="https://github.com/sparsh7637"
            linkedinLink="https://www.linkedin.com/in/sparsh-gulati-665032287/"
            instagramLink="https://www.instagram.com/sparsh_7637/"
          />
        </div>
        <div className="items-center justify-center max-w-[30rem] max-h-[30rem] mb-10 mt-10">
          <BackgroundGradientDemo
            imgSrc="/devs/vasu.jpg"
            description="Vasu Reena Kush Varshney"
            githubLink="https://github.com/Vasu-Varshneya"
            linkedinLink="https://www.linkedin.com/in/vasu-varshney-16b8a9278/"
            instagramLink="https://www.instagram.com/vasuvarshney28/#"
          />
        </div>
        <div className="items-center justify-center max-w-[30rem] max-h-[30rem] mb-10 mt-10">
          <BackgroundGradientDemo
            imgSrc="/devs/abdullah.jpg"
            description="Abdullah Ansari"
            githubLink="https://github.com/abdullah-426"
            linkedinLink="https://www.linkedin.com/in/abdullah-ansari-b0a5a0276/"
            instagramLink="https://www.instagram.com/abdullah_26176/"
          />
        </div>
      </div>
    </section>
  );
}