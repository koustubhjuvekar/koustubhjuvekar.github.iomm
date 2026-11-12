export interface SubProjectItem {
  id: string;
  name: string;
  meta: string;
  hasLab?: 'webserver' | '3tier';
}

export interface TechSubGroup {
  name: string;
  items: string[];
}

export interface ProjectCategoryCard {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  iconUrl: string;
  projects?: SubProjectItem[];
  subGroups?: TechSubGroup[];
}

export interface FeaturedCaseStudy {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
}

export interface WebServerStep {
  stepNumber: string;
  title: string;
  description: string;
  commands?: { label?: string; code: string; meaning?: string }[];
  infoNote?: string;
  image?: string;
  ports?: { port: string; protocol: string; purpose: string }[];
}

export interface CommandQuickRef {
  num: string;
  command: string;
  purpose: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  codeSnippet?: string;
}

export interface ArchitectureTierCard {
  title: string;
  tag: string;
  description: string;
}

export interface ProjectDetailData {
  id: string;
  title: string;
  badge: string;
  layoutType: 'lab' | 'architecture';
  goalHeading: string;
  goalDescription: string;
  engineerNote: string;
  heroImage?: string;
  steps: WebServerStep[];
  quickCommands: CommandQuickRef[];
  faqs: FaqItem[];
  architectureCards: ArchitectureTierCard[];
}

export interface CertificateBannerItem {
  id: string;
  title: string;
  alt: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface SocialLinkItem {
  name: string;
  url: string;
  icon: string;
}

export interface ProfileData {
  name: string;
  shortName: string;
  heroTagline: string;
  typedHeadline: string;
  typedSecondary: string;
  heroSubtitle: string;
  heroHighlightText: string;
  aboutGreeting: string;
  aboutBio: string;
  servicesSubtitle: string;
  location: string;
  phone: string;
  phoneHref: string;
  email: string;
  website: string;
  resumeUrl: string;
  portraitImage: string;
  portraitRoleBadge: string;
  logoImage: string;
  whatsappQrImage: string;
  githubUsername: string;
  socials: SocialLinkItem[];
}

export interface PortfolioContentData {
  profile: ProfileData;
  featuredAboutProjects: FeaturedCaseStudy[];
  projectCategories: ProjectCategoryCard[];
  certificatesBanner: CertificateBannerItem[];
  services: ServiceItem[];
  projectDetails: Record<string, ProjectDetailData>;
}

export const PROFILE_DATA: ProfileData = {
  name: 'Koustubh Juvekar',
  shortName: 'KJ',
  heroTagline: 'AWS Cloud · Docker · Kubernetes · DevOps · Cybersecurity',
  typedHeadline: 'I am AWS Cloud and DevOps Engineer!',
  typedSecondary: 'AWS Cloud • Docker • Kubernetes • CI/CD',
  heroSubtitle:
    'Koustubh Juvekar — Computer Engineering Graduate & Cloud Engineer based in Pune, India.',
  heroHighlightText:
    'Trained in AWS, Docker, DevOps, and Kubernetes, with hands-on implementations across cloud deployment, VPC networking, CI/CD pipelines, and cybersecurity fundamentals.',
  aboutGreeting: "Hi there, I'm KJ,",
  aboutBio:
    'Computer Engineering graduate with knowledge of Cloud Computing, DevOps practices, and cybersecurity fundamentals. Skilled in working with AWS services, containerization, automation, and cloud infrastructure concepts. Hands-on experience through projects and practical implementations involving cloud deployment, networking, security, and application management. Passionate about learning new technologies and building reliable, scalable solutions. Currently seeking opportunities to apply my skills, contribute to innovative projects, and grow in the Cloud and DevOps domain!',
  servicesSubtitle:
    'Trained in AWS, Docker, DevOps, and Kubernetes, with a keen interest in helping organizations enhance their software delivery and operations!',
  location: 'Pune, India.',
  phone: '+91 7588 558818',
  phoneHref: 'tel:+917588558818',
  email: 'koustubhjuvekarofficial@gmail.com',
  website: 'www.koustubhjuvekar.in',
  resumeUrl: '/resume.pdf',
  portraitImage: '/images/header-background.jpg',
  portraitRoleBadge: 'AWS Cloud & DevOps',
  logoImage: '/images/logo.png',
  whatsappQrImage: '/images/whatsapp-qr.png',
  githubUsername: 'koustubhjuvekar',
  socials: [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/koustubhjuvekar/',
      icon: '/images/LinkedInlogo.png',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/koustubhjuvekar',
      icon: '/images/git.png',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/koustubh.18',
      icon: '/images/insta.png',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/koustubhjuvekar',
      icon: '/images/fb.png',
    },
    {
      name: 'X',
      url: 'https://twitter.com/itsKoustubhJ',
      icon: '/images/x.png',
    },
  ],
};

export const FEATURED_ABOUT_PROJECTS: FeaturedCaseStudy[] = [
  {
    id: 'healthcare-microservices',
    title: 'HEALTHCARE MICROSERVICES PLATFORM',
    description:
      'Worked on a healthcare-based microservices application deployed on AWS and GCP using Kubernetes (EKS, GKE), leveraging containerized, serverless, and VM-based architectures for scalable and reliable services.',
    responsibilities: [
      'Deployed applications using EKS, GKE, AWS Lambda, Cloud Run, EC2, and GCE',
      'Developed backend and frontend services',
      'Managed databases using AWS RDS and GCP Cloud SQL',
      'Implemented CI/CD pipelines using GitHub Actions and Jenkins',
    ],
  },
  {
    id: 'aws-cloud-deployment',
    title: 'AWS CLOUD DEPLOYMENT PROJECT',
    description:
      'Designed and deployed cloud infrastructure using AWS services with focus on networking, security, availability, and automation.',
    responsibilities: [
      'Configured VPC, Subnets, Security Groups',
      'Worked with EC2, Load Balancer and RDS',
      'Implemented cloud deployment practices',
      'Applied security and monitoring concepts',
    ],
  },
];

export const PROJECT_CATEGORIES_LIBRARY: ProjectCategoryCard[] = [
  {
    id: 'aws',
    title: 'AWS Projects',
    subtitle: 'EC2 • VPC • S3 • IAM • Networking',
    description: 'Cloud infrastructure and AWS operations projects.',
    iconUrl: '/images/aws.svg',
    projects: [
      {
        id: 'aws-01-webserver',
        name: '01. Web Server Installation on AWS EC2',
        meta: 'EC2 • Apache • Security Group • HTTP',
        hasLab: 'webserver',
      },
      {
        id: 'aws-02-3tier',
        name: '02. Three-Tier VPC Architecture',
        meta: 'VPC • Public/Private Subnets • Routing',
        hasLab: '3tier',
      },
      {
        id: 'aws-03-autoscaling',
        name: '03. EC2 Auto Scaling Setup',
        meta: 'EC2 • Auto Scaling • High Availability',
      },
      {
        id: 'aws-04-alb',
        name: '04. Application Load Balancer',
        meta: 'ALB • Target Groups • Health Checks',
      },
      {
        id: 'aws-05-s3',
        name: '05. S3 Static Website Hosting',
        meta: 'S3 • Static Hosting • Bucket Policy',
      },
      {
        id: 'aws-06-route53',
        name: '06. Route 53 DNS Configuration',
        meta: 'Route 53 • DNS • Domain Routing',
      },
      {
        id: 'aws-07-iam',
        name: '07. IAM Users and Roles',
        meta: 'IAM • Policies • Roles',
      },
      {
        id: 'aws-08-cloudwatch',
        name: '08. CloudWatch Monitoring',
        meta: 'Metrics • Logs • Alarms',
      },
      {
        id: 'aws-09-lambda',
        name: '09. Lambda Serverless Application',
        meta: 'Lambda • Events • Serverless Workflow',
      },
      {
        id: 'aws-10-rds',
        name: '10. RDS PostgreSQL Deployment',
        meta: 'RDS • PostgreSQL • Security Groups',
      },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps Projects',
    subtitle: 'Containers • Orchestration • CI/CD',
    description: 'Select a technology to open its focused project list.',
    iconUrl: '/images/docker.png',
    subGroups: [
      {
        name: 'Docker',
        items: [
          'Dockerized Node.js Application',
          'Multi-Container Application with Docker Compose',
          'Custom Docker Image and Registry',
          'Docker Networking and Volumes',
          'Dockerized React + API Application',
          'Docker Health Checks and Environment Variables',
        ],
      },
      {
        name: 'Kubernetes',
        items: [
          'Kubernetes Deployment and Service',
          'ConfigMap and Secret Management',
          'Kubernetes Ingress Configuration',
          'Horizontal Pod Autoscaling',
          'Kubernetes Rolling Deployment',
          'EKS Application Deployment',
        ],
      },
    ],
  },
  {
    id: 'jenkins',
    title: 'Jenkins',
    subtitle: 'CI/CD • Pipelines • Deployment',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg',
    projects: [
      {
        id: 'jenkins-01',
        name: 'Jenkins Freestyle Project',
        meta: 'Build • Test • Deploy',
      },
      {
        id: 'jenkins-02',
        name: 'Jenkins Pipeline Project',
        meta: 'Pipeline • Stages • Artifacts',
      },
      {
        id: 'jenkins-03',
        name: 'Jenkins + Docker CI/CD',
        meta: 'Build Image • Push • Deploy',
      },
      {
        id: 'jenkins-04',
        name: 'Jenkins + Kubernetes Deployment',
        meta: 'CI/CD • Kubernetes • Rolling Update',
      },
    ],
  },
  {
    id: 'github',
    title: 'Git / GitHub',
    subtitle: 'Source Control • Branching • Collaboration',
    iconUrl: '/images/git.png',
    projects: [
      {
        id: 'git-01',
        name: 'Git Workflow and Branching',
        meta: 'Branch • Merge • Rebase',
      },
      {
        id: 'git-02',
        name: 'GitHub Repository Management',
        meta: 'Repository • Remote • Pull',
      },
      {
        id: 'git-03',
        name: 'Pull Request Workflow',
        meta: 'PR • Review • Merge',
      },
    ],
  },
  {
    id: 'terraform',
    title: 'Terraform',
    subtitle: 'Infrastructure as Code • AWS Provisioning',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg',
    projects: [
      {
        id: 'tf-01',
        name: 'AWS EC2 with Terraform',
        meta: 'Resource • Variable • Output',
      },
      {
        id: 'tf-02',
        name: 'Terraform VPC Deployment',
        meta: 'VPC • Subnet • Route Table',
      },
      {
        id: 'tf-03',
        name: 'Terraform Modules',
        meta: 'Reusable Infrastructure',
      },
    ],
  },
  {
    id: 'gitlab',
    title: 'GitLab',
    subtitle: 'Repositories • CI/CD • Runners',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gitlab/gitlab-original.svg',
    projects: [
      {
        id: 'gitlab-01',
        name: 'GitLab CI/CD Pipeline',
        meta: 'Stages • Jobs • Artifacts',
      },
      {
        id: 'gitlab-02',
        name: 'GitLab Runner Setup',
        meta: 'Runner • Build • Deploy',
      },
    ],
  },
  {
    id: 'bitbucket',
    title: 'Bitbucket',
    subtitle: 'Git Workflows • Pipelines',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bitbucket/bitbucket-original.svg',
    projects: [
      {
        id: 'bb-01',
        name: 'Bitbucket Repository Workflow',
        meta: 'Branch • Pull Request • Merge',
      },
      {
        id: 'bb-02',
        name: 'Bitbucket Pipeline',
        meta: 'Build • Test • Deploy',
      },
    ],
  },
  {
    id: 'ansible',
    title: 'Ansible',
    subtitle: 'Configuration Management • Automation',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ansible/ansible-original.svg',
    projects: [
      {
        id: 'ansible-01',
        name: 'Apache Installation with Ansible',
        meta: 'Playbook • Package • Service',
      },
      {
        id: 'ansible-02',
        name: 'Linux Server Configuration',
        meta: 'Users • Packages • Files',
      },
      {
        id: 'ansible-03',
        name: 'Application Deployment with Ansible',
        meta: 'Roles • Templates • Handlers',
      },
    ],
  },
];

export const CERTIFICATES_BANNER: CertificateBannerItem[] = [
  {
    id: 'google-cyber',
    title: 'Google Cybersecurity Certificate',
    alt: 'Google Certificate',
    image: '/images/googlecyber.jpg',
  },
  {
    id: 'isc2-cc',
    title: 'ISC2 Certified in Cybersecurity (CC)',
    alt: 'ISC2 Certificate',
    image: '/images/isc2.jpg',
  },
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'aws-cloud',
    title: 'AWS Cloud',
    icon: '/images/aws-icon.png',
    description:
      'As a fresher passionate about cloud technologies, I have recently completed training in AWS Cloud Computing and am keen to support companies with cloud adoption and optimization.',
  },
  {
    id: 'devops',
    title: 'DevOps',
    icon: '/images/devops.png',
    description:
      'Recently trained in DevOps methodologies, I aim to contribute to organizations by optimizing software delivery, automating deployments, and improving operational efficiency.',
  },
  {
    id: 'development',
    title: 'Development',
    icon: '/images/dev.png',
    description:
      'I have learned HTML, CSS, JavaScript for front-end development, and Python with MySQL for back-end and database handling.',
  },
];

export const THREE_TIER_CARDS: ArchitectureTierCard[] = [
  {
    title: 'Presentation',
    tag: 'Frontend Layer',
    description:
      'The visually stunning user interface built with HTML, CSS, and JS. It provides a seamless and interactive experience for the users.',
  },
  {
    title: 'Application',
    tag: 'Logic Layer',
    description:
      'The brain of the system. APIs and backend code built in Node.js/Python that process user inputs, apply business rules, and route data.',
  },
  {
    title: 'Database',
    tag: 'Data Layer',
    description:
      'The secure vault. A robust relational or NoSQL database ensuring data integrity, optimized queries, and safe storage.',
  },
];

export const WEBSERVER_LAB_STEPS: WebServerStep[] = [
  {
    stepNumber: '01',
    title: 'Launch AWS Instance',
    description:
      'Launch an AWS EC2 instance. After launching the instance, identify its Public IP address and the Security Group attached to it.',
    image: '/images/webserver/image1.png',
  },
  {
    stepNumber: '02',
    title: 'Open the Security Group',
    description:
      'Click on the EC2 instance. Then: Scroll down -> Security -> Click Security Group.',
    image: '/images/webserver/image2.png',
  },
  {
    stepNumber: '03',
    title: 'Check the Inbound Rules',
    description:
      "Check the Security Group's Inbound Rules. The required ports should be open. If a required port is not open, click on Edit Inbound Rules, add the rule, and save it.",
    ports: [
      { port: '22', protocol: 'SSH', purpose: 'Used to connect to the server remotely.' },
      { port: '80', protocol: 'HTTP', purpose: 'Used for normal HTTP web traffic.' },
      { port: '443', protocol: 'HTTPS', purpose: 'Used for HTTPS traffic when TLS/SSL is configured.' },
    ],
    infoNote: 'Inbound Rule: Defines which ports are allowed to accept incoming requests from the internet.',
    image: '/images/webserver/image3.png',
  },
  {
    stepNumber: '04',
    title: 'Copy the Public IP Address',
    description:
      'Copy the Public IP address of the AWS EC2 instance. This IP address will later be entered in the browser to access the webpage.',
    image: '/images/webserver/image4.png',
  },
  {
    stepNumber: '05',
    title: 'SSH Into the Server',
    description: 'Now SSH into the server using PowerShell or any client shell.',
    commands: [
      {
        code: 'ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP',
        meaning: 'Connects to the EC2 server remotely using SSH.',
      },
    ],
  },
  {
    stepNumber: '06',
    title: 'Update Server Packages',
    description: 'Update the packages on the server before installing Apache.',
    commands: [
      {
        code: 'sudo yum update -y',
        meaning: 'Updates the available packages on the server.',
      },
    ],
  },
  {
    stepNumber: '07',
    title: 'Install Apache Web Server',
    description: 'Install the Apache HTTP Server package on the server.',
    commands: [
      {
        code: 'sudo yum install httpd -y',
        meaning: 'Installs the Apache HTTP Server package on the server.',
      },
    ],
  },
  {
    stepNumber: '08',
    title: 'Check Apache Version',
    description: 'Verify that Apache was installed successfully by checking its version.',
    commands: [
      {
        code: 'httpd -v',
        meaning: 'Displays the installed Apache HTTP Server version and helps verify that the software is installed.',
      },
    ],
    image: '/images/webserver/image5.png',
  },
  {
    stepNumber: '09',
    title: 'Start Apache Server',
    description: 'Start the Apache web server. Both commands perform the same task. You can use either one.',
    commands: [
      {
        label: 'Option 1',
        code: 'sudo service httpd start',
      },
      {
        label: 'Option 2',
        code: 'sudo systemctl start httpd',
        meaning: 'Both commands start the Apache HTTP Server.',
      },
    ],
  },
  {
    stepNumber: '10',
    title: 'Check Apache Status',
    description: 'Check whether the Apache service is running. Both commands provide the Apache service status.',
    commands: [
      {
        label: 'Option 1',
        code: 'sudo service httpd status',
      },
      {
        label: 'Option 2',
        code: 'sudo systemctl status httpd',
        meaning: 'Both commands display the current Apache service status.',
      },
    ],
  },
  {
    stepNumber: '11',
    title: 'Enable Apache at Boot',
    description: 'Enable Apache so that it starts automatically whenever the server comes back online.',
    commands: [
      {
        code: 'sudo systemctl enable httpd',
        meaning: 'Enables Apache to start automatically when the server boots.',
      },
    ],
  },
  {
    stepNumber: '12',
    title: "Go to Apache's Document Root",
    description: 'Apache uses a document root to serve webpages. In this project we will create our webpage inside:',
    commands: [
      {
        code: 'cd /var/www/html',
        meaning: "Moves into Apache's default document root directory used in this project.",
      },
    ],
  },
  {
    stepNumber: '13',
    title: 'Create index.html',
    description: 'Now create the webpage using the nano editor.',
    commands: [
      {
        code: 'sudo nano index.html',
        meaning: 'Opens the nano editor and creates or edits the index.html file.',
      },
    ],
  },
  {
    stepNumber: '14',
    title: 'Add HTML Code and Save',
    description: 'When nano opens, write or paste your HTML code inside index.html. After adding the code, save the file.',
    infoNote: 'Save the file: Press Ctrl + X, Press Y, Press Enter.',
    image: '/images/webserver/image6.png',
  },
  {
    stepNumber: '15',
    title: 'Open the Website in Browser',
    description: 'Now go to the browser and enter the EC2 Public IP address using HTTP.',
    commands: [
      {
        code: 'http://YOUR_PUBLIC_IP/',
        meaning: 'Your index.html webpage should be displayed in the browser.',
      },
    ],
    image: '/images/webserver/image7.png',
  },
];

export const WEBSERVER_QUICK_COMMANDS: CommandQuickRef[] = [
  { num: '01', command: 'ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP', purpose: 'Connect to the EC2 server remotely using SSH.' },
  { num: '02', command: 'sudo yum update -y', purpose: 'Update available packages on the server.' },
  { num: '03', command: 'sudo yum install httpd -y', purpose: 'Install the Apache HTTP Server package.' },
  { num: '04', command: 'httpd -v', purpose: 'Verify the installed Apache version.' },
  { num: '05', command: 'sudo service httpd start', purpose: 'Start the Apache HTTP Server (Option 1).' },
  { num: '06', command: 'sudo systemctl start httpd', purpose: 'Start the Apache HTTP Server (Option 2).' },
  { num: '07', command: 'sudo service httpd status', purpose: 'Check Apache service status (Option 1).' },
  { num: '08', command: 'sudo systemctl status httpd', purpose: 'Check Apache service status (Option 2).' },
  { num: '09', command: 'sudo systemctl enable httpd', purpose: 'Enable Apache to start automatically at boot.' },
  { num: '10', command: 'cd /var/www/html', purpose: 'Move into Apache default document root directory.' },
  { num: '11', command: 'sudo nano index.html', purpose: 'Create or edit the index.html webpage file.' },
  { num: '12', command: 'http://YOUR_PUBLIC_IP/', purpose: 'Open the hosted webpage in the browser using Public IP.' },
  { num: '13', command: 'sudo systemctl restart httpd', purpose: 'Restart Apache after configuration changes.' },
  { num: '14', command: 'sudo systemctl stop httpd', purpose: 'Stop the running Apache service.' },
];

export const WEBSERVER_FAQS: FaqItem[] = [
  {
    question: 'Why do we check the Security Group inbound rules first?',
    answer:
      'Even if Apache is installed and running inside the server, external users cannot reach the website unless port 80 (HTTP) or port 443 (HTTPS) is open in the AWS Security Group. Similarly, port 22 (SSH) must be open for remote terminal access.',
  },
  {
    question: 'What is the difference between sudo service httpd start and sudo systemctl start httpd?',
    answer:
      'Both commands start the Apache HTTP Server on Amazon Linux / RHEL. systemctl is the modern systemd service manager command, while service is a compatibility wrapper that delegates to systemd.',
  },
  {
    question: 'Why do we run sudo systemctl enable httpd?',
    answer:
      'Starting Apache only runs it for the current boot session. Enabling the service ensures that if the EC2 instance is rebooted, Apache starts automatically without manual intervention.',
  },
  {
    question: 'Why did we create index.html inside /var/www/html?',
    answer:
      'By default, Apache HTTP Server is configured with DocumentRoot "/var/www/html" in /etc/httpd/conf/httpd.conf. Any static HTML files placed inside this directory are served directly over HTTP.',
  },
  {
    question: 'Can we change the default folder (/var/www/html) from which Apache serves files?',
    answer:
      'Yes. You can update the DocumentRoot directive and corresponding <Directory> block inside /etc/httpd/conf/httpd.conf, then reload or restart httpd.',
    codeSnippet: 'DocumentRoot "/var/www/mywebsite"',
  },
  {
    question: 'Why does Apache automatically load index.html when we visit http://YOUR_IP/?',
    answer:
      'Apache uses the DirectoryIndex directive (set to index.html by default) to determine which default file to serve when a client requests a directory root URL.',
    codeSnippet: 'DirectoryIndex index.html',
  },
  {
    question: 'Can we make another file (such as home.html) open by default instead of index.html?',
    answer:
      'Yes. By changing the DirectoryIndex directive in Apache configuration to home.html and restarting httpd, visiting http://YOUR_IP/ will serve home.html automatically.',
    codeSnippet: 'DirectoryIndex home.html',
  },
  {
    question: 'How can we open a specific page using the browser URL?',
    answer:
      'Append the filename to the server IP or domain (e.g., http://YOUR_IP/about.html or http://YOUR_IP/contact.html), or link between pages using standard HTML anchor tags.',
    codeSnippet: '<a href="about.html">About Us</a>\n<a href="contact.html">Contact</a>\n<a href="services.html">Services</a>',
  },
];

export const DEFAULT_PROJECT_DETAILS: Record<string, ProjectDetailData> = {
  'aws-01-webserver': {
    id: 'aws-01-webserver',
    title: '01. Web Server Installation on AWS EC2',
    badge: 'AWS EC2 • LINUX • APACHE • HTTP',
    layoutType: 'lab',
    goalHeading: 'The Goal — From EC2 Instance to a Working Website',
    goalDescription:
      'The purpose of this project is to create a basic web server (Apache web server here) on an AWS instance and verify that a webpage can be served to a user through the server’s public IP address.',
    engineerNote:
      "Before uploading a developer's code, we can create a simple sample index page and test it. If it loads successfully, we know that the basic server and network configuration are working.",
    heroImage: '/images/webserver/goal.png',
    steps: WEBSERVER_LAB_STEPS,
    quickCommands: WEBSERVER_QUICK_COMMANDS,
    faqs: WEBSERVER_FAQS,
    architectureCards: [],
  },
  'aws-02-3tier': {
    id: 'aws-02-3tier',
    title: '02. Three-Tier VPC Architecture',
    badge: '3-TIER ARCHITECTURE',
    layoutType: 'architecture',
    goalHeading: '3-Tier Architecture',
    goalDescription:
      'Experience the modern, scalable, and beautifully designed application layers.',
    engineerNote:
      'Separating Presentation, Application, and Database tiers across public and private subnets strengthens security and scalability.',
    heroImage: '',
    steps: [],
    quickCommands: [],
    faqs: [],
    architectureCards: THREE_TIER_CARDS,
  },
};

export const DEFAULT_PORTFOLIO_CONTENT: PortfolioContentData = {
  profile: PROFILE_DATA,
  featuredAboutProjects: FEATURED_ABOUT_PROJECTS,
  projectCategories: PROJECT_CATEGORIES_LIBRARY,
  certificatesBanner: CERTIFICATES_BANNER,
  services: SERVICES_DATA,
  projectDetails: DEFAULT_PROJECT_DETAILS,
};

export function getOrCreateProjectDetail(
  content: PortfolioContentData,
  projectId: string,
  projectTitle: string,
  projectMeta = 'CLOUD • DEVOPS • PRACTICAL'
): ProjectDetailData {
  const existing = content.projectDetails[projectId];
  if (existing) {
    return existing;
  }
  return {
    id: projectId,
    title: projectTitle,
    badge: projectMeta.toUpperCase(),
    layoutType: 'lab',
    goalHeading: `${projectTitle} — Overview`,
    goalDescription: `Practical implementation guide and technical documentation for ${projectTitle}.`,
    engineerNote:
      'Log in as Admin to add or edit step-by-step instructions, upload screenshots, add CLI commands, and document FAQs for this project.',
    heroImage: '',
    steps: [],
    quickCommands: [],
    faqs: [],
    architectureCards: [],
  };
}
