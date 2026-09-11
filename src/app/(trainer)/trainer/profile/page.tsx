import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import TrainerProfileClient, { TrainerProfileData } from '@/components/trainer/TrainerProfileClient'

export const metadata = {
  title: 'My Faculty Profile | Trainer Portal | Recruitment Institute',
}

export default async function TrainerProfilePage() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    redirect('/trainer-login')
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      specialization: true,
      bio: true,
      image: true,
      profileJson: true,
    },
  })

  if (!trainer) {
    redirect('/trainer-login')
  }

  const profile = (trainer.profileJson && typeof trainer.profileJson === 'object')
    ? (trainer.profileJson as Record<string, any>)
    : {}

  const initialData: TrainerProfileData = {
    id: trainer.id,
    name: trainer.name,
    email: trainer.email,
    phone: trainer.phone || '',
    image: trainer.image || '',
    designation: profile.designation || trainer.specialization || 'Faculty Trainer',
    experienceYears: profile.experienceYears ?? 15,
    companyEx: profile.companyEx || '',
    linkedinUrl: profile.linkedinUrl || '',
    quote: profile.quote || '',
    bio: trainer.bio || profile.bio || '',
    longBio: profile.longBio || trainer.bio || '',
    specializationTags: Array.isArray(profile.specializationTags)
      ? profile.specializationTags
      : (trainer.specialization ? trainer.specialization.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    coursesTaught: Array.isArray(profile.coursesTaught) ? profile.coursesTaught : [],
  }

  return (
    <TrainerLayout title="My Faculty Profile" trainerName={trainer.name}>
      <TrainerProfileClient initialData={initialData} />
    </TrainerLayout>
  )
}
