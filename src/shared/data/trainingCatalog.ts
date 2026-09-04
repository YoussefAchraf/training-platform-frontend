export interface CatalogTrainingEntry {
  name: string;
  description: string;
}

export interface ProviderTrainingCatalog {
  
  
  
  providerName: string;
  trainings: CatalogTrainingEntry[];
}








export const TRAINING_CATALOG: ProviderTrainingCatalog[] = [
  {
    providerName: 'AWS (Amazon Web Services)',
    trainings: [
      {
        name: 'AWS Certified Cloud Practitioner',
        description: 'Foundational overview of AWS cloud concepts, core services, security, and billing.',
      },
      {
        name: 'AWS Certified Solutions Architect – Associate',
        description: 'Designing available, cost-efficient, fault-tolerant, and scalable systems on AWS.',
      },
      {
        name: 'AWS Certified Solutions Architect – Professional',
        description: 'Advanced AWS architecture design covering migration, cost optimization, and multi-account governance.',
      },
      {
        name: 'AWS Certified Developer – Associate',
        description: 'Developing and maintaining applications on AWS using core services and the AWS SDK.',
      },
      {
        name: 'AWS Certified SysOps Administrator – Associate',
        description: 'Deploying, managing, and operating AWS workloads with a focus on monitoring and automation.',
      },
      {
        name: 'AWS Certified DevOps Engineer – Professional',
        description: 'Implementing CI/CD pipelines, automated infrastructure, and monitoring on AWS.',
      },
      {
        name: 'AWS Certified Security – Specialty',
        description: 'Specialized data protection, incident response, and infrastructure security on AWS.',
      },
      {
        name: 'AWS Certified Machine Learning – Specialty',
        description: 'Building, training, tuning, and deploying machine learning models on AWS.',
      },
    ],
  },
  {
    providerName: 'Google Cloud Platform (GCP)',
    trainings: [
      {
        name: 'Google Cloud Digital Leader',
        description: 'Foundational understanding of cloud technology capabilities and their business value.',
      },
      {
        name: 'Associate Cloud Engineer',
        description: 'Deploying applications, monitoring operations, and managing solutions on Google Cloud.',
      },
      {
        name: 'Professional Cloud Architect',
        description: 'Designing, developing, and managing robust, secure, scalable Google Cloud solutions.',
      },
      {
        name: 'Professional Data Engineer',
        description: 'Designing and building data processing systems and ML models on Google Cloud.',
      },
      {
        name: 'Professional Cloud DevOps Engineer',
        description: 'Implementing SRE practices, CI/CD, and service reliability on Google Cloud.',
      },
      {
        name: 'Professional Cloud Security Engineer',
        description: 'Designing and implementing secure infrastructure on Google Cloud.',
      },
      {
        name: 'Professional Machine Learning Engineer',
        description: 'Designing, building, and productionizing ML models on Google Cloud.',
      },
    ],
  },
  {
    providerName: 'Microsoft Azure',
    trainings: [
      {
        name: 'Azure Fundamentals (AZ-900)',
        description: 'Foundational cloud concepts and core Azure services, pricing, and support.',
      },
      {
        name: 'Azure Administrator Associate (AZ-104)',
        description: 'Managing Azure identities, governance, storage, compute, and virtual networks.',
      },
      {
        name: 'Azure Solutions Architect Expert (AZ-305)',
        description: 'Designing infrastructure, data, business continuity, and identity solutions on Azure.',
      },
      {
        name: 'Azure Developer Associate (AZ-204)',
        description: 'Designing, building, testing, and maintaining cloud applications on Azure.',
      },
      {
        name: 'Azure DevOps Engineer Expert (AZ-400)',
        description: 'Designing and implementing DevOps practices for build, test, and release pipelines on Azure.',
      },
      {
        name: 'Azure Security Engineer Associate (AZ-500)',
        description: 'Implementing security controls, managing identity and access, and protecting data on Azure.',
      },
      {
        name: 'Azure Data Fundamentals (DP-900)',
        description: 'Core data concepts and how they are implemented using Azure data services.',
      },
      {
        name: 'Azure AI Fundamentals (AI-900)',
        description: 'Foundational machine learning and AI concepts on Azure.',
      },
    ],
  },
  {
    providerName: 'Oracle Cloud Infrastructure (OCI)',
    trainings: [
      {
        name: 'OCI Foundations Associate',
        description: 'Foundational understanding of OCI core services, architecture, security, and pricing.',
      },
      {
        name: 'OCI Architect Associate',
        description: 'Designing and implementing OCI solutions covering compute, storage, and networking.',
      },
      {
        name: 'OCI Architect Professional',
        description: 'Advanced multi-tier, highly available architecture design on OCI.',
      },
      {
        name: 'OCI DevOps Professional',
        description: 'Implementing CI/CD, infrastructure as code, and container orchestration on OCI.',
      },
      {
        name: 'Oracle Autonomous Database Specialist',
        description: "Administering and optimizing Oracle's self-driving database on OCI.",
      },
    ],
  },
  {
    providerName: 'Alibaba Cloud',
    trainings: [
      {
        name: 'Alibaba Cloud Certified Associate (ACA) - Cloud Computing',
        description: 'Foundational Alibaba Cloud products, architecture, and core services.',
      },
      {
        name: 'Alibaba Cloud Certified Professional (ACP) - Cloud Computing',
        description: 'Advanced deployment and management of Alibaba Cloud infrastructure.',
      },
      {
        name: 'Alibaba Cloud Certified Expert (ACE) - Big Data',
        description: 'Advanced big data solution architecture and administration on Alibaba Cloud.',
      },
    ],
  },
  {
    providerName: 'The Linux Foundation',
    trainings: [
      {
        name: 'Linux Foundation Certified System Administrator (LFCS)',
        description: 'Core Linux system administration: users, storage, networking, and services.',
      },
      {
        name: 'Linux Foundation Certified Engineer (LFCE)',
        description: 'Advanced Linux administration: networking, security, and service configuration at scale.',
      },
      {
        name: 'Introduction to Linux (LFS101)',
        description: 'Beginner-friendly foundation course covering core Linux concepts and command-line skills.',
      },
      {
        name: 'FinOps Certified Practitioner',
        description: 'Cloud financial management practices for engineering, finance, and business teams.',
      },
    ],
  },
  {
    providerName: 'Cloud Native Computing Foundation (CNCF)',
    trainings: [
      {
        name: 'Certified Kubernetes Administrator (CKA)',
        description: 'Installing, configuring, and managing production-grade Kubernetes clusters.',
      },
      {
        name: 'Certified Kubernetes Application Developer (CKAD)',
        description: 'Designing, building, and deploying cloud-native applications on Kubernetes.',
      },
      {
        name: 'Certified Kubernetes Security Specialist (CKS)',
        description: 'Securing container-based applications and Kubernetes platforms in production.',
      },
      {
        name: 'Kubernetes and Cloud Native Associate (KCNA)',
        description: 'Foundational knowledge of Kubernetes and the wider cloud-native ecosystem.',
      },
      {
        name: 'Prometheus Certified Associate (PCA)',
        description: 'Core monitoring and alerting concepts using Prometheus.',
      },
      {
        name: 'GitOps Certified Associate (GitOps-CA)',
        description: 'Applying GitOps principles for infrastructure and application delivery.',
      },
    ],
  },
  {
    providerName: 'DevOps Institute',
    trainings: [
      {
        name: 'DevOps Foundation',
        description: 'Core DevOps principles, practices, and terminology for cross-functional teams.',
      },
      {
        name: 'DevOps Leader',
        description: 'Leading and sustaining a DevOps transformation across culture, process, and technology.',
      },
      {
        name: 'SRE Foundation',
        description: 'Foundational site reliability engineering practices: SLIs, SLOs, error budgets, and toil reduction.',
      },
      {
        name: 'Continuous Delivery Ecosystem Foundation',
        description: 'Building automated, reliable software delivery pipelines.',
      },
      {
        name: 'DevSecOps Foundation',
        description: 'Integrating security practices directly into the DevOps pipeline.',
      },
    ],
  },
  {
    providerName: 'PeopleCert',
    trainings: [
      {
        name: 'ITIL 4 Foundation',
        description: 'Core IT service management concepts, terminology, and the ITIL 4 service value system.',
      },
      {
        name: 'PRINCE2 Foundation',
        description: 'Structured project management method covering principles, themes, and processes.',
      },
      {
        name: 'PRINCE2 Agile Foundation',
        description: 'Combining PRINCE2 governance with agile delivery methods.',
      },
      {
        name: 'Scrum Master Certification',
        description: 'Facilitating Scrum practices and supporting agile teams as a certified Scrum Master.',
      },
    ],
  },
  {
    providerName: 'Cloud Security Alliance (CSA)',
    trainings: [
      {
        name: 'Certificate of Cloud Security Knowledge (CCSK)',
        description: 'Vendor-neutral foundational cloud security knowledge and best practices.',
      },
      {
        name: 'Certificate of Cloud Auditing Knowledge (CCAK)',
        description: 'Auditing cloud computing systems against established frameworks and standards.',
      },
    ],
  },
  {
    providerName: 'CompTIA',
    trainings: [
      {
        name: 'CompTIA A+',
        description: 'Foundational IT support skills: hardware, networking, mobile devices, and troubleshooting.',
      },
      {
        name: 'CompTIA Network+',
        description: 'Core networking concepts, infrastructure, and troubleshooting across wired and wireless networks.',
      },
      {
        name: 'CompTIA Security+',
        description: 'Foundational cybersecurity skills: risk management, threats, and network security.',
      },
      {
        name: 'CompTIA Linux+',
        description: 'Core Linux administration skills across major distributions.',
      },
      {
        name: 'CompTIA Cloud+',
        description: 'Cloud infrastructure deployment, security, and troubleshooting across vendors.',
      },
      {
        name: 'CompTIA CySA+',
        description: 'Behavioral analytics to prevent, detect, and combat cybersecurity threats.',
      },
      {
        name: 'CompTIA PenTest+',
        description: 'Penetration testing and vulnerability management skills.',
      },
      {
        name: 'CompTIA Project+',
        description: 'Foundational project management skills for IT and business professionals.',
      },
    ],
  },
  {
    providerName: 'Red Hat',
    trainings: [
      {
        name: 'RH124 – Red Hat System Administration I',
        description: 'Core command-line administration of Red Hat Enterprise Linux systems.',
      },
      {
        name: 'RH134 – Red Hat System Administration II',
        description: 'Automating and managing RHEL storage, security, and boot processes.',
      },
      {
        name: 'RH294 – Red Hat Enterprise Linux Automation with Ansible',
        description: 'Automating Linux administration tasks at scale using Ansible.',
      },
      {
        name: 'RHCSA – Red Hat Certified System Administrator',
        description: 'Hands-on certification exam covering core RHEL administration skills.',
      },
      {
        name: 'RHCE – Red Hat Certified Engineer',
        description: 'Hands-on certification exam covering RHEL automation with Ansible.',
      },
      {
        name: 'DO180 – Red Hat OpenShift Administration I',
        description: 'Deploying and managing containerized applications on Red Hat OpenShift.',
      },
      {
        name: 'DO280 – Red Hat OpenShift Administration II',
        description: 'Configuring and managing a production-grade OpenShift cluster.',
      },
      {
        name: 'DO447 – Ansible Security Automation',
        description: 'Automating security operations tasks using Red Hat Ansible Automation Platform.',
      },
    ],
  },
  {
    providerName: 'SUSE',
    trainings: [
      {
        name: 'SUSE Certified Administrator in SUSE Linux Enterprise Server',
        description: 'Core SLES administration: storage, networking, and system management.',
      },
      {
        name: 'SUSE Certified Engineer in SUSE Linux Enterprise Server',
        description: 'Advanced SLES administration and troubleshooting.',
      },
      {
        name: 'Rancher/RKE2 Certified Administrator',
        description: 'Deploying and managing Kubernetes clusters with Rancher and RKE2.',
      },
      {
        name: 'SUSE Certified Administrator in Enterprise Storage',
        description: 'Managing SUSE Enterprise Storage (Ceph-based) clusters.',
      },
    ],
  },
  {
    providerName: 'VMware Tanzu (by Broadcom)',
    trainings: [
      {
        name: 'VMware Certified Professional – Data Center Virtualization (VCP-DCV)',
        description: 'Core vSphere virtualization deployment and management.',
      },
      {
        name: 'VMware Certified Professional – Application Modernization (Tanzu)',
        description: 'Building and running Kubernetes-based platforms with Tanzu.',
      },
      {
        name: 'VMware NSX-T Data Center Administration',
        description: 'Deploying and managing NSX-T software-defined networking.',
      },
    ],
  },
  {
    providerName: 'Cisco',
    trainings: [
      {
        name: 'CCNA – Cisco Certified Network Associate',
        description: 'Foundational networking: IP connectivity, security fundamentals, and automation.',
      },
      {
        name: 'CCNP Enterprise',
        description: 'Advanced enterprise networking: core technologies plus a concentration exam.',
      },
      {
        name: 'CCNP Security',
        description: 'Advanced network security design and implementation.',
      },
      {
        name: 'CCIE Enterprise Infrastructure',
        description: 'Expert-level enterprise network design, deployment, and troubleshooting.',
      },
      {
        name: 'DevNet Associate',
        description: 'Foundational software development and automation skills for Cisco platforms.',
      },
      {
        name: 'CyberOps Associate',
        description: 'Foundational security operations center (SOC) analyst skills.',
      },
    ],
  },
  {
    providerName: 'IBM',
    trainings: [
      {
        name: 'IBM Certified Data Engineer',
        description: 'Designing, building, and maintaining data pipelines on IBM Cloud.',
      },
      {
        name: 'IBM Certified Solution Architect – Cloud Pak for Data',
        description: "Architecting IBM's unified data and AI platform.",
      },
      {
        name: 'IBM Certified Associate Developer – Watson AI Foundations',
        description: 'Foundational AI/ML application development on IBM Watson.',
      },
      {
        name: 'IBM Z Systems Fundamentals',
        description: 'Foundational mainframe concepts and z/OS administration.',
      },
    ],
  },
  {
    providerName: 'HashiCorp',
    trainings: [
      {
        name: 'HashiCorp Certified: Terraform Associate',
        description: 'Core infrastructure-as-code concepts and workflows using Terraform.',
      },
      {
        name: 'HashiCorp Certified: Vault Associate',
        description: 'Secrets management, encryption, and identity-based access with Vault.',
      },
      {
        name: 'HashiCorp Certified: Consul Associate',
        description: 'Service networking, discovery, and mesh configuration with Consul.',
      },
      {
        name: 'HashiCorp Certified: Nomad Associate',
        description: 'Application deployment and orchestration with Nomad.',
      },
    ],
  },
  {
    providerName: 'GitLab',
    trainings: [
      {
        name: 'GitLab Certified Associate',
        description: 'Core GitLab platform usage: repositories, merge requests, and CI/CD basics.',
      },
      {
        name: 'GitLab Certified CI/CD Associate',
        description: 'Building and maintaining GitLab CI/CD pipelines.',
      },
      {
        name: 'GitLab Certified Security Specialist',
        description: 'Implementing DevSecOps practices and vulnerability management in GitLab.',
      },
    ],
  },
  {
    providerName: 'GitHub',
    trainings: [
      {
        name: 'GitHub Foundations',
        description: 'Core Git and GitHub fundamentals: repositories, branches, and collaboration.',
      },
      {
        name: 'GitHub Actions',
        description: 'Building and automating CI/CD workflows with GitHub Actions.',
      },
      {
        name: 'GitHub Advanced Security',
        description: 'Implementing code scanning, secret scanning, and dependency review.',
      },
      {
        name: 'GitHub Copilot',
        description: 'Using AI-assisted coding effectively within a development workflow.',
      },
    ],
  },
  {
    providerName: 'Puppet',
    trainings: [
      {
        name: 'Puppet Certified Professional',
        description: 'Core Puppet configuration management: modules, manifests, and Hiera.',
      },
      {
        name: 'Puppet Fundamentals for System Administrators',
        description: 'Foundational infrastructure automation with Puppet.',
      },
    ],
  },
  {
    providerName: 'Chef (by Progress)',
    trainings: [
      {
        name: 'Chef Fundamentals',
        description: 'Core infrastructure automation concepts using Chef cookbooks and recipes.',
      },
      {
        name: 'Chef Certified Developer',
        description: 'Building and testing Chef cookbooks for configuration management at scale.',
      },
    ],
  },
  {
    providerName: 'Splunk',
    trainings: [
      {
        name: 'Splunk Core Certified User',
        description: 'Core search, reporting, and dashboard skills in Splunk.',
      },
      {
        name: 'Splunk Core Certified Power User',
        description: 'Advanced searching, field extraction, and data modeling.',
      },
      {
        name: 'Splunk Core Certified Advanced Power User',
        description: 'Complex search commands, correlation, and dashboard design.',
      },
      {
        name: 'Splunk Enterprise Certified Admin',
        description: 'Installing, configuring, and maintaining a Splunk deployment.',
      },
      {
        name: 'Splunk SOAR Certified Automation Developer',
        description: 'Building security orchestration and automated response playbooks.',
      },
    ],
  },
  {
    providerName: 'Datadog',
    trainings: [
      {
        name: 'Datadog Fundamentals',
        description: 'Core observability concepts: metrics, traces, and logs in Datadog.',
      },
      {
        name: 'Datadog APM and Distributed Tracing',
        description: 'Implementing application performance monitoring and tracing.',
      },
      {
        name: 'Datadog Log Management',
        description: 'Collecting, processing, and analyzing logs at scale in Datadog.',
      },
    ],
  },
  {
    providerName: 'Dynatrace',
    trainings: [
      {
        name: 'Dynatrace Associate',
        description: 'Core platform navigation, monitoring setup, and problem detection.',
      },
      {
        name: 'Dynatrace Professional',
        description: 'Advanced configuration, custom dashboards, and AI-driven root-cause analysis.',
      },
    ],
  },
  {
    providerName: 'Elastic',
    trainings: [
      {
        name: 'Elastic Certified Engineer',
        description: 'Deploying, managing, and troubleshooting an Elasticsearch cluster.',
      },
      {
        name: 'Elastic Certified Observability Engineer',
        description: 'Implementing logs, metrics, and APM with the Elastic Stack.',
      },
      {
        name: 'Elastic Certified Analyst',
        description: 'Building visualizations and dashboards in Kibana.',
      },
    ],
  },
  {
    providerName: 'New Relic',
    trainings: [
      {
        name: 'New Relic Certified Professional',
        description: 'Core platform usage: monitoring, alerting, and dashboards.',
      },
      {
        name: 'New Relic APM Fundamentals',
        description: 'Application performance monitoring setup and analysis.',
      },
    ],
  },
  {
    providerName: 'NVIDIA (Deep Learning Institute)',
    trainings: [
      {
        name: 'Fundamentals of Deep Learning',
        description: 'Core neural network concepts and hands-on model training with NVIDIA GPUs.',
      },
      {
        name: 'Fundamentals of Accelerated Computing with CUDA',
        description: 'GPU-accelerated application development using CUDA.',
      },
      {
        name: 'Building Transformer-Based Natural Language Processing Applications',
        description: 'Applying transformer architectures to NLP tasks.',
      },
      {
        name: 'Deep Learning for Computer Vision',
        description: 'Building and deploying computer vision models using deep learning.',
      },
    ],
  },
  {
    providerName: 'Hugging Face',
    trainings: [
      {
        name: 'Hugging Face NLP Course',
        description: 'Building and fine-tuning transformer models with the Hugging Face ecosystem.',
      },
      {
        name: 'Hugging Face Deep Reinforcement Learning Course',
        description: 'Core reinforcement learning concepts using Hugging Face tools.',
      },
      {
        name: 'Hugging Face Audio Course',
        description: 'Processing and modeling audio data with transformer-based models.',
      },
    ],
  },
  {
    providerName: 'Databricks',
    trainings: [
      {
        name: 'Databricks Certified Data Engineer Associate',
        description: 'Core data engineering on the Databricks Lakehouse Platform.',
      },
      {
        name: 'Databricks Certified Data Engineer Professional',
        description: 'Advanced pipeline design, optimization, and governance.',
      },
      {
        name: 'Databricks Certified Machine Learning Associate',
        description: 'Building and managing ML workflows on Databricks.',
      },
      {
        name: 'Databricks Certified Generative AI Engineer Associate',
        description: 'Building applications with large language models on Databricks.',
      },
    ],
  },
  {
    providerName: 'TensorFlow',
    trainings: [
      {
        name: 'TensorFlow Developer Certificate',
        description: 'Building and training neural network models using TensorFlow.',
      },
      {
        name: 'DeepLearning.AI TensorFlow Developer Professional Certificate',
        description: 'Practical deep learning skills using TensorFlow across vision, NLP, and sequence models.',
      },
    ],
  },
  {
    providerName: 'DeepLearning.AI',
    trainings: [
      {
        name: 'Deep Learning Specialization',
        description: 'Foundational and advanced neural network architectures across five courses.',
      },
      {
        name: 'Machine Learning Specialization',
        description: 'Core supervised and unsupervised learning concepts.',
      },
      {
        name: 'Generative AI for Everyone',
        description: 'Non-technical introduction to generative AI capabilities and applications.',
      },
      {
        name: 'ChatGPT Prompt Engineering for Developers',
        description: 'Practical prompt engineering techniques for building LLM applications.',
      },
      {
        name: 'MLOps Specialization',
        description: 'Deploying, monitoring, and maintaining machine learning systems in production.',
      },
    ],
  },
];



export function getTrainingsForProvider(providerName: string): CatalogTrainingEntry[] {
  const normalized = providerName.trim().toLowerCase();
  if (!normalized) return [];
  return TRAINING_CATALOG.find((entry) => entry.providerName.toLowerCase() === normalized)?.trainings ?? [];
}




export function findProviderNameForTraining(trainingName: string): string | undefined {
  const normalized = trainingName.trim().toLowerCase();
  if (!normalized) return undefined;
  for (const entry of TRAINING_CATALOG) {
    if (entry.trainings.some((training) => training.name.toLowerCase() === normalized)) {
      return entry.providerName;
    }
  }
  return undefined;
}

export function findTrainingDescription(providerName: string, trainingName: string): string | undefined {
  const normalizedTraining = trainingName.trim().toLowerCase();
  return getTrainingsForProvider(providerName).find((training) => training.name.toLowerCase() === normalizedTraining)
    ?.description;
}
