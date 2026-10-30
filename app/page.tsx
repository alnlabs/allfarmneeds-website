import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

async function ServiceCategories() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('id, name_en, name_te')
    .order('name_en')

  if (error) {
    return <p>{error.message}</p>
  }

  return (
    <ul>
      {categories?.map((category) => (
        <li key={category.id}>
          {category.name_te} — {category.name_en}
        </li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <main>
      <h1>AllFarmNeeds</h1>
      <Suspense fallback={<ul />}>
        <ServiceCategories />
      </Suspense>
    </main>
  )
}
