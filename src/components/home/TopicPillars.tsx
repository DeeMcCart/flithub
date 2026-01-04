import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FINANCIAL_PILLARS, FRAUD_PILLAR } from '@/lib/constants';
import {
  Heart,
  Shield,
  Smartphone,
  Briefcase,
  Receipt,
  FileCheck,
  PiggyBank,
  TrendingUp,
  Calculator,
  Wallet,
  CreditCard,
  Landmark,
  AlertCircle,
  ShieldAlert,
  Eye,
  ShieldCheck,
  FileWarning,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Shield,
  Smartphone,
  Briefcase,
  Receipt,
  FileCheck,
  PiggyBank,
  TrendingUp,
  Calculator,
  Wallet,
  CreditCard,
  Landmark,
  AlertCircle,
  ShieldAlert,
  Eye,
  ShieldCheck,
  FileWarning,
};

const colorMap: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/20',
  info: 'bg-info/10 text-info border-info/20',
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  government: 'bg-government/10 text-government border-government/20',
};

const badgeColorMap: Record<string, string> = {
  success: 'bg-success/10 text-success hover:bg-success/20 border-success/30',
  info: 'bg-info/10 text-info hover:bg-info/20 border-info/30',
  primary: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/30',
  accent: 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/30',
  warning: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/30',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30',
  government: 'bg-government/10 text-government hover:bg-government/20 border-government/30',
};

function SubtopicLink({ 
  subtopic, 
  color 
}: { 
  subtopic: { value: string; label: string; icon: string }; 
  color: string;
}) {
  const Icon = iconMap[subtopic.icon];
  
  return (
    <Link
      to={`/resources?topic=${encodeURIComponent(subtopic.value)}`}
      className="group"
    >
      <Badge 
        variant="outline" 
        className={`${badgeColorMap[color]} px-3 py-2 text-sm font-medium transition-all hover:scale-105 cursor-pointer`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 mr-1.5" />}
        {subtopic.label}
      </Badge>
    </Link>
  );
}

function PillarCard({ 
  pillar 
}: { 
  pillar: typeof FINANCIAL_PILLARS[number] | typeof FRAUD_PILLAR;
}) {
  const Icon = iconMap[pillar.icon];
  
  return (
    <AccordionItem value={pillar.id} className="border-0">
      <Card className="border hover:shadow-md transition-shadow">
        <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
          <CardHeader className="flex flex-row items-center gap-4 p-4 w-full">
            <div className={`w-12 h-12 rounded-xl ${colorMap[pillar.color]} flex items-center justify-center shrink-0`}>
              {Icon && <Icon className="h-6 w-6" />}
            </div>
            <div className="text-left flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-tight">
                {pillar.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {pillar.description}
              </p>
            </div>
          </CardHeader>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="flex flex-wrap gap-2">
              {pillar.subtopics.map((subtopic) => (
                <SubtopicLink 
                  key={subtopic.value} 
                  subtopic={subtopic} 
                  color={pillar.color} 
                />
              ))}
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

function FraudSection() {
  const Icon = iconMap[FRAUD_PILLAR.icon];
  
  return (
    <Card className="border-2 border-destructive/30 bg-destructive/5 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-3">
        <div className="w-14 h-14 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
          {Icon && <Icon className="h-7 w-7" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-lg font-bold text-destructive">
              {FRAUD_PILLAR.title}
            </CardTitle>
            <Badge variant="destructive" className="text-xs">Important</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {FRAUD_PILLAR.description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {FRAUD_PILLAR.subtopics.map((subtopic) => (
            <SubtopicLink 
              key={subtopic.value} 
              subtopic={subtopic} 
              color="destructive" 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const ALL_PILLARS = [...FINANCIAL_PILLARS, FRAUD_PILLAR];

export function TopicPillars() {
  return (
    <section className="container py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
          Explore by Topic
        </h2>
        <p className="text-muted-foreground">
          Financial literacy organised around the six key pillars
        </p>
      </div>

      {/* Pillars Grid */}
      <Accordion type="multiple" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_PILLARS.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </Accordion>
    </section>
  );
}
