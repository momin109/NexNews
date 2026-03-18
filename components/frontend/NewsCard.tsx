import Image from "next/image";
import { Clock } from "lucide-react";

type NewsCardProps = {
  title: string;
  category: string;
  time: string;
  image?: string;
  horizontal?: boolean;
};

export function NewsCard({
  title,
  category,
  time,
  image,
  horizontal = false,
}: NewsCardProps) {
  return (
    <article
      className={`group cursor-pointer ${
        horizontal ? "flex gap-3 md:gap-4" : "space-y-3"
      }`}
    >
      <div
        className={`overflow-hidden rounded-xl bg-muted ${
          horizontal
            ? "h-20 w-24 shrink-0 md:h-24 md:w-32"
            : "aspect-[16/10] w-full"
        }`}
      >
        <Image
          src={
            image ||
            "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=500&fit=crop"
          }
          alt={title}
          width={800}
          height={500}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            {category}
          </span>

          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock size={10} /> {time}
          </span>
        </div>

        <h3
          className={`font-bold leading-tight transition-colors group-hover:text-primary ${
            horizontal
              ? "line-clamp-2 text-xs md:text-sm"
              : "line-clamp-2 text-base md:text-lg"
          }`}
        >
          {title}
        </h3>
      </div>
    </article>
  );
}

// import { Clock } from "lucide-react";

// export function NewsCard({ title, category, time, image, horizontal = false }) {
//   return (
//     <div
//       className={`group cursor-pointer ${horizontal ? "flex gap-3 md:gap-4" : "space-y-3"}`}
//     >
//       <div
//         className={`overflow-hidden rounded-lg bg-muted ${horizontal ? "w-24 h-20 md:w-32 md:h-24 shrink-0" : "aspect-video w-full"}`}
//       >
//         <img
//           src={
//             image ||
//             `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&h=300&fit=crop`
//           }
//           alt={title}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//       </div>
//       <div className="space-y-1">
//         <div className="flex items-center gap-2">
//           <span className="text-[10px] font-black uppercase text-primary tracking-tighter">
//             {category}
//           </span>
//           <span className="text-[10px] text-muted-foreground flex items-center gap-1">
//             <Clock size={10} /> {time}
//           </span>
//         </div>
//         <h3
//           className={`font-bold leading-tight group-hover:text-primary transition-colors ${horizontal ? "text-xs md:text-sm line-clamp-2" : "text-base md:text-lg line-clamp-2"}`}
//         >
//           {title}
//         </h3>
//       </div>
//     </div>
//   );
// }
