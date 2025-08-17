import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Web3-Powered Mental Health',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Revolutionary mental health platform built on Internet Computer Protocol,
        ensuring privacy, security, and decentralized access to mental health services.
      </>
    ),
  },
  {
    title: 'Professional Therapy Services',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Connect with licensed mental health professionals through secure,
        blockchain-verified sessions. Access therapy, counseling, and peer support.
      </>
    ),
  },
  {
    title: 'AI-Enhanced Support',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Intelligent AI chatbots provide 24/7 mental health support, crisis intervention,
        and personalized wellness recommendations powered by advanced algorithms.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
