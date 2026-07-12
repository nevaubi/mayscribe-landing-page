import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  company?: string
  role?: string
  message?: string
  submittedAt?: string
}

const DemoRequestEmail = ({
  name = 'Unknown',
  email = 'unknown@example.com',
  company,
  role,
  message = '(no message)',
  submittedAt,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New MayScribe demo request from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New demo request</Heading>
        <Text style={muted}>
          Someone submitted the "Book a demo" form on mayscribe.com.
        </Text>

        <Section style={card}>
          <Row label="Name" value={name} />
          <Row label="Email" value={email} />
          {company ? <Row label="Company" value={company} /> : null}
          {role ? <Row label="Role" value={role} /> : null}
          {submittedAt ? <Row label="Submitted" value={submittedAt} /> : null}
        </Section>

        <Hr style={hr} />

        <Text style={label}>Message</Text>
        <Text style={messageStyle}>{message}</Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label}: </span>
    <span style={rowValue}>{value}</span>
  </Text>
)

export const template = {
  component: DemoRequestEmail,
  subject: (data: Record<string, any>) =>
    `New MayScribe demo request — ${data?.name ?? 'unknown'}`,
  displayName: 'Demo request notification',
  to: 'fshaher@mayscribe.com',
  previewData: {
    name: 'Jane Clinician',
    email: 'jane@example.com',
    company: 'Example Health',
    role: 'CMIO',
    message: 'Interested in a pilot for our internal medicine group.',
    submittedAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#061338' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: '#061338' }
const muted = { fontSize: '14px', color: '#46587E', margin: '0 0 20px' }
const card = { backgroundColor: '#F8FBFF', border: '1px solid #E6EEF8', borderRadius: '10px', padding: '16px 18px' }
const row = { fontSize: '14px', margin: '4px 0', color: '#0B1F52' }
const rowLabel = { color: '#46587E', fontWeight: 600 }
const rowValue = { color: '#061338' }
const hr = { borderColor: '#E6EEF8', margin: '24px 0' }
const label = { fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#0D57FA', textTransform: 'uppercase' as const, margin: '0 0 6px' }
const messageStyle = { fontSize: '14px', lineHeight: '22px', color: '#0B1F52', whiteSpace: 'pre-wrap' as const, margin: 0 }
