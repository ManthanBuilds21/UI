import CollectionCard from '../../components/cards/CollectionCard'
import Reveal, { staggerContainer } from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import { useCatalog } from '../../hooks/useCatalog'

export default function FeaturedCollectionsSection() {
  const { collections } = useCatalog()

  return (
    <section className="page-shell py-10 sm:py-14">
      <Reveal className="section-frame">
        <SectionHeading
          eyebrow="Featured Collections"
          title="Editorial capsules with their own color field and rhythm."
          description="Each collection extends the same MANTHAN identity through a different emotional lane, letting the product stay central while the palette sets the mood."
        />
      </Reveal>

      <Reveal
        variants={staggerContainer}
        className="section-frame mt-10 grid gap-6 lg:grid-cols-2"
      >
        {collections.map((collection) => (
          <Reveal key={collection.id}>
            <CollectionCard collection={collection} />
          </Reveal>
        ))}
      </Reveal>
    </section>
  )
}
