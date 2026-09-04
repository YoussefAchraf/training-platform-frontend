export interface ProviderIconEntry {
  name: string;
  category: string;
  iconUrl: string | null;
}








export const PROVIDER_ICONS: ProviderIconEntry[] = [
  
  {
    name: 'AWS (Amazon Web Services)',
    category: 'Cloud Hyperscalers',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  },
  {
    name: 'Google Cloud Platform (GCP)',
    category: 'Cloud Hyperscalers',
    iconUrl: 'https://cdn.simpleicons.org/googlecloud',
  },
  {
    name: 'Microsoft Azure',
    category: 'Cloud Hyperscalers',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg',
  },
  {
    name: 'Oracle Cloud Infrastructure (OCI)',
    category: 'Cloud Hyperscalers',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
  },
  {
    name: 'Alibaba Cloud',
    category: 'Cloud Hyperscalers',
    iconUrl: 'https://cdn.simpleicons.org/alibabacloud',
  },

  
  {
    name: 'The Linux Foundation',
    category: 'Open-Source Foundations & Neutral Bodies',
    iconUrl: 'https://cdn.simpleicons.org/linuxfoundation',
  },
  {
    name: 'Cloud Native Computing Foundation (CNCF)',
    category: 'Open-Source Foundations & Neutral Bodies',
    iconUrl: 'https://cdn.simpleicons.org/cncf',
  },
  { name: 'DevOps Institute', category: 'Open-Source Foundations & Neutral Bodies', iconUrl: null },
  {
    name: 'PeopleCert',
    category: 'Open-Source Foundations & Neutral Bodies',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/PClogo_en.png',
  },
  {
    name: 'Cloud Security Alliance (CSA)',
    category: 'Open-Source Foundations & Neutral Bodies',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Cloud_Security_Alliance_logo.png',
  },
  {
    name: 'CompTIA',
    category: 'Open-Source Foundations & Neutral Bodies',
    iconUrl: 'https://cdn.simpleicons.org/comptia',
  },

  
  { name: 'Red Hat', category: 'Linux & Enterprise Software Giants', iconUrl: 'https://cdn.simpleicons.org/redhat' },
  { name: 'SUSE', category: 'Linux & Enterprise Software Giants', iconUrl: 'https://cdn.simpleicons.org/suse' },
  {
    name: 'VMware Tanzu (by Broadcom)',
    category: 'Linux & Enterprise Software Giants',
    
    
    iconUrl: 'https://cdn.simpleicons.org/vmware',
  },
  { name: 'Cisco', category: 'Linux & Enterprise Software Giants', iconUrl: 'https://cdn.simpleicons.org/cisco' },
  {
    name: 'IBM',
    category: 'Linux & Enterprise Software Giants',
    
    
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  },

  
  {
    name: 'HashiCorp',
    category: 'Infrastructure as Code & Platform Automation',
    iconUrl: 'https://cdn.simpleicons.org/hashicorp',
  },
  {
    name: 'GitLab',
    category: 'Infrastructure as Code & Platform Automation',
    iconUrl: 'https://cdn.simpleicons.org/gitlab',
  },
  {
    name: 'GitHub',
    category: 'Infrastructure as Code & Platform Automation',
    iconUrl: 'https://cdn.simpleicons.org/github',
  },
  {
    name: 'Puppet',
    category: 'Infrastructure as Code & Platform Automation',
    iconUrl: 'https://cdn.simpleicons.org/puppet',
  },
  {
    name: 'Chef (by Progress)',
    category: 'Infrastructure as Code & Platform Automation',
    iconUrl: 'https://cdn.simpleicons.org/chef',
  },

  
  { name: 'Splunk', category: 'Observability, AIOps, & SRE Tooling', iconUrl: 'https://cdn.simpleicons.org/splunk' },
  {
    name: 'Datadog',
    category: 'Observability, AIOps, & SRE Tooling',
    iconUrl: 'https://cdn.simpleicons.org/datadog',
  },
  {
    name: 'Dynatrace',
    category: 'Observability, AIOps, & SRE Tooling',
    iconUrl: 'https://cdn.simpleicons.org/dynatrace',
  },
  { name: 'Elastic', category: 'Observability, AIOps, & SRE Tooling', iconUrl: 'https://cdn.simpleicons.org/elastic' },
  {
    name: 'New Relic',
    category: 'Observability, AIOps, & SRE Tooling',
    iconUrl: 'https://cdn.simpleicons.org/newrelic',
  },

  
  {
    name: 'NVIDIA (Deep Learning Institute)',
    category: 'Artificial Intelligence & Machine Learning Specialists',
    iconUrl: 'https://cdn.simpleicons.org/nvidia',
  },
  {
    name: 'Hugging Face',
    category: 'Artificial Intelligence & Machine Learning Specialists',
    iconUrl: 'https://cdn.simpleicons.org/huggingface',
  },
  {
    name: 'Databricks',
    category: 'Artificial Intelligence & Machine Learning Specialists',
    iconUrl: 'https://cdn.simpleicons.org/databricks',
  },
  {
    name: 'TensorFlow',
    category: 'Artificial Intelligence & Machine Learning Specialists',
    iconUrl: 'https://cdn.simpleicons.org/tensorflow',
  },
  { name: 'DeepLearning.AI', category: 'Artificial Intelligence & Machine Learning Specialists', iconUrl: null },
];





export function findProviderIcon(name: string): string | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  const match = PROVIDER_ICONS.find((entry) => entry.name.toLowerCase() === normalized);
  return match?.iconUrl ?? undefined;
}
