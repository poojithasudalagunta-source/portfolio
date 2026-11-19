import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Github,
  GraduationCap,
  Layers3,
  MoreHorizontal,
  SquarePen,
  FolderOpen,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  Network,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { categories, featuredProjects, portfolio, projectCategory, projects, skills } from './data/projects.js'
import { CustomCursor, MagneticLink, MotionSystem, Scene, SceneItem, ScrollProgress, easeOut, reveal, spring, stagger, useRevealProps } from './motion.jsx'

const { github: GITHUB, linkedin: LINKEDIN, email: EMAIL } = portfolio.links

const projectIcons = {
  pantry: Boxes,
  medical: Cpu,
  dock: Layers3,
  community: Leaf,
  vision: Network,
  agent: Sparkles,
  mail: Mail,
  study: BookOpen,
  quote: MessageCircle,
  game: Sparkles,
  network: Network,
  code: Code2,
  spark: Sparkles,
  clock: Clock3,
  chat: MessageCircle,
  focus: Cpu,
}

function currentProjectId() {
  const route = window.location.hash.slice(1)
  return route.startsWith('project/') ? route.slice('project/'.length) : null
}

function safeExternalProps() {
  return { target: '_blank', rel: 'noreferrer noopener' }
}

function useRoute() {
  const [projectId, setProjectId] = useState(currentProjectId)
  const projectIdRef = useRef(projectId)

  useEffect(() => {
    const onHashChange = () => {
      const nextId = currentProjectId()
      const projectRouteChanged = nextId !== projectIdRef.current
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (projectRouteChanged) window.scrollTo(0, 0)
      projectIdRef.current = nextId
      setProjectId(nextId)
      if (!nextId) requestAnimationFrame(() => {
        const section = window.location.hash.slice(1)
        const target = document.getElementById(section)?.closest('.scroll-scene') || document.getElementById(section)
        if (target) target.scrollIntoView({ behavior: projectRouteChanged || reduceMotion ? 'auto' : 'smooth', block: 'start' })
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const project = projects.find((entry) => entry.id === projectId)
    document.title = project
      ? `${project.title} — ${portfolio.name}`
      : `${portfolio.name} — ${portfolio.title}`
  }, [projectId])

  return projectId
}

function Navbar({ detail = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const reduced = useReducedMotion()
  const [activeSection, setActiveSection] = useState('top')
  const navItems = [
    ['Home', 'top'],
    ['About', 'about'],
    ['Projects', 'projects'],
    ['Research', 'research'],
    ['Skills', 'skills'],
    ['Education', 'experience'],
    ['Contact', 'contact'],
  ]

  useEffect(() => {
    const sections = navItems.map(([, id]) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return undefined
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveSection(visible.target.id)
    }, { rootMargin: '-20% 0px -58% 0px', threshold: [0, 0.15, 0.35, 0.6] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [detail])

  const goTo = (id) => {
    setMenuOpen(false)
    if (!currentProjectId() && window.location.hash === `#${id}`) {
      (document.getElementById(id)?.closest('.scroll-scene') || document.getElementById(id))?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      return
    }
    window.location.hash = id
  }

  return (
    <motion.header
      className="site-header"
      initial={reduced ? false : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { ...spring, delay: 0.12 }}
    >
      <div className="nav-shell">
        <a className="brand" href="#top" aria-label={`${portfolio.name}, home`} onClick={() => setMenuOpen(false)}>
          <motion.span className="brand-mark" initial={reduced ? false : { scale: 0.62, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={reduced ? { duration: 0 } : { ...spring, delay: 0.28 }}>SP</motion.span>
          <span className="brand-name">{portfolio.brand}<span className="brand-period">.</span></span>
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <nav id="primary-navigation" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {navItems.map(([label, id]) => (
            <a key={id} className={activeSection === id ? 'is-active' : ''} aria-current={activeSection === id ? 'location' : undefined} href={`#${id}`} onClick={(event) => { event.preventDefault(); goTo(id) }}>
              {label}
            </a>
          ))}
          <a className="nav-social" href={GITHUB} {...safeExternalProps()} aria-label="GitHub profile">
            <Github size={16} />
          </a>
          <a className="nav-social" href={LINKEDIN} {...safeExternalProps()} aria-label="LinkedIn profile"><BriefcaseBusiness size={16} /></a>
          <MagneticLink className="nav-connect" href="#contact" data-cursor="SAY HELLO">Let’s connect <ArrowUpRight size={13} /></MagneticLink>
        </nav>
      </div>
      {detail && <div className="nav-detail-indicator"><span /> Project case study</div>}
    </motion.header>
  )
}

function SectionHeading({ eyebrow, title, copy, light = false, id }) {
  return (
    <div className={`section-heading${light ? ' section-heading-light' : ''}`}>
      <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  )
}

function Hero() {
  const heroRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !heroRef.current || window.matchMedia('(max-width: 760px)').matches) return undefined
    let context
    let cancelled = false
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (cancelled || !heroRef.current) return
      const gsap = gsapModule.gsap || gsapModule.default
      const ScrollTrigger = triggerModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)
      context = gsap.context(() => {
        gsap.to('.hero-content', {
          y: -26,
          scale: 0.96,
          opacity: 0.72,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.65 },
        })
        gsap.to('.hero-coordinate', {
          x: 24,
          y: -8,
          opacity: 0.12,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
        })
      }, heroRef)
    }).catch((error) => console.error('Hero scroll animation could not be initialized.', error))
    return () => { cancelled = true; context?.revert() }
  }, [reduced])

  const focusRows = [
    ['01', 'Product engineering', Code2],
    ['02', 'AI & machine learning', Cpu],
    ['03', 'Mobile applications', Boxes],
    ['04', 'Computer vision', Network],
  ]

  return (
    <motion.section
      ref={heroRef}
      className="hero section-wrap"
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="hero-content">
        <motion.div className="hero-scroll-layer" initial={reduced ? false : 'hidden'} animate="visible" variants={stagger}>
          <motion.div className="availability" variants={reveal}><span className="availability-pulse" /> Computer Science & Engineering <span className="availability-divider">/</span> VIT Chennai <span className="availability-divider">/</span> ’28</motion.div>
          <h1 id="hero-title">
            <span className="hero-title-mask"><motion.span variants={reveal}>{portfolio.heroTitle[0]}</motion.span></span>
            <span className="hero-title-mask"><motion.span variants={reveal}><span>{portfolio.heroTitle[1].split(' ')[0]}</span> {portfolio.heroTitle[1].split(' ').slice(1).join(' ')}</motion.span></span>
          </h1>
          <motion.p className="hero-lede" variants={reveal}>{portfolio.tagline}</motion.p>
          <motion.div className="hero-actions">
            <MagneticLink className="button button-primary" href="#featured" data-cursor="EXPLORE">Explore my work <ArrowRight size={16} /></MagneticLink>
            <MagneticLink className="button button-quiet" href="#contact" data-cursor="SAY HELLO">Let’s connect <ArrowUpRight size={15} /></MagneticLink>
          </motion.div>
          <motion.div className="hero-socials" variants={reveal}>
            <a href={GITHUB} {...safeExternalProps()} aria-label="GitHub profile" data-cursor="GITHUB"><Github size={15} /> GitHub</a>
            <a href={LINKEDIN} {...safeExternalProps()} aria-label="LinkedIn profile" data-cursor="LINKEDIN"><BriefcaseBusiness size={14} /> LinkedIn</a>
          </motion.div>
          <motion.div className="hero-footnote" variants={reveal}><span className="hero-line" /> Building, learning, and documenting along the way</motion.div>
        </motion.div>
      </div>
      <div className="hero-right">
        <div className="hero-aside" aria-label="Areas of focus">
          <div className="aside-index">FOCUS AREAS <span>01 — 04</span></div>
          {focusRows.map(([index, label, Icon], item) => (
            <SceneItem key={label} index={item} total={4}>
              <motion.div className="focus-row" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { duration: 0.4, delay: item * 0.06, ease: easeOut }}><span>{index}</span><b>{label}</b><Icon size={16} /></motion.div>
            </SceneItem>
          ))}
          <div className="aside-bottom"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></div>
        </div>
      </div>
      <span className="hero-coordinate" aria-hidden="true">13.0827° N &nbsp; 80.2707° E</span>
    </motion.section>
  )
}

function About() {
  const revealProps = useRevealProps()
  return (
    <section className="section-wrap about-section" id="about" aria-labelledby="about-title">
      <motion.div className="about-left" variants={reveal} {...revealProps}>
        <SectionHeading eyebrow="A little context" title="Curiosity, turned into working systems." id="about-title" />
      </motion.div>
      <motion.div className="about-right" variants={stagger} {...revealProps}>
        <motion.p className="about-lead" variants={reveal}>I’m a Computer Science and Engineering student at VIT Chennai, graduating in 2028. I like taking a practical problem from a rough idea to a working interface, then tracing the data and decisions behind it.</motion.p>
        <motion.p className="about-copy" variants={reveal}>My public projects range from mobile and full-stack prototypes to computer vision experiments and small browser tools. I’m interested in software that is useful, explainable, and clear about what it can and cannot do.</motion.p>
        <div className="about-facts">
          <motion.div className="fact" variants={reveal}><GraduationCap size={17} /><span>VIT Chennai</span><small>Computer Science & Engineering</small></motion.div>
          <motion.div className="fact" variants={reveal}><BriefcaseBusiness size={17} /><span>Open to learning</span><small>Software · AI/ML · research</small></motion.div>
        </div>
        <motion.div className="about-interest-grid" variants={stagger}>
          {portfolio.focusAreas.map(({ title, copy, href, icon, tone }, index) => { const Icon = projectIcons[icon]; return <SceneItem key={title} index={index} total={portfolio.focusAreas.length}><motion.a className={`about-interest-card tone-${tone}`} href={href} variants={reveal} whileHover={{ y: -4 }} transition={spring}><span className="about-interest-index">0{index + 1}</span><span className="about-interest-icon"><Icon size={16} /></span><b>{title}</b><small>{copy}</small><ArrowUpRight className="about-interest-arrow" size={14} /></motion.a></SceneItem> })}
        </motion.div>
      </motion.div>
    </section>
  )
}

function ProjectVisual({ project, compact = false }) {
  const Icon = projectIcons[project.icon] || Layers3
  if (project.image) {
    return (
      <div className={`project-visual project-visual-image${compact ? ' visual-compact' : ''}`}>
        <div className="visual-fallback" aria-hidden="true"><div className="visual-glow" /><Icon className="visual-icon" strokeWidth={1.1} /></div>
        <img src={project.image} alt={project.imageAlt} loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />
        <span className="visual-label">PROJECT ARTWORK</span>
      </div>
    )
  }
  return (
    <div className={`project-visual project-visual-diagram visual-${project.icon}${compact ? ' visual-compact' : ''}`} aria-hidden="true">
      <div className="visual-glow" />
      <span className="visual-index">{project.id === 'yolo-weed-detection' ? 'CV / 01' : project.id === 'mediquery-ai' ? 'APP / 02' : 'BUILD / 0' + ((projects.indexOf(project) % 8) + 1)}</span>
      <Icon className="visual-icon" strokeWidth={1.1} />
      <span className="visual-lines"><i /><i /><i /></span>
      <span className="visual-label">{project.category.toUpperCase()}</span>
    </div>
  )
}

function ProjectCard({ project, featured = false }) {
  const reduced = useReducedMotion()
  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 24, mass: 0.5 })
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 24, mass: 0.5 })
  const tilt = (event) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    rawRotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 4)
    rawRotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 4)
  }
  const resetTilt = () => { rawRotateX.set(0); rawRotateY.set(0) }

  return (
    <motion.a
      className={`project-card${featured ? ' project-card-featured' : ''}`}
      href={`#project/${project.id}`}
      data-cursor="VIEW PROJECT"
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
      whileHover={reduced ? undefined : { y: -5, boxShadow: '0 24px 55px rgba(0,0,0,.3)' }}
      whileTap={reduced ? undefined : { scale: 0.995 }}
      transition={spring}
      layout
    >
      <ProjectVisual project={project} compact={!featured} />
      <div className="project-card-body">
        <div className="project-card-meta"><span>{project.variant}</span><span className="meta-dot" /> <span>{project.status.split(' · ')[0]}</span></div>
        <div className="project-card-title-row"><h3>{project.title}</h3><span className="card-arrow"><ArrowUpRight size={16} /></span></div>
        <p>{project.description}</p>
        <div className="tag-row">{project.stack.slice(0, featured ? 4 : 3).map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div>
        <span className="project-card-action">Open case study <ArrowUpRight size={13} /></span>
      </div>
    </motion.a>
  )
}

function FeaturedProjects() {
  const revealProps = useRevealProps()
  const reduced = useReducedMotion()
  return (
    <section className="section-wrap featured-section" id="featured" aria-labelledby="featured-title">
      <motion.div variants={reveal} {...revealProps}><SectionHeading eyebrow="Selected work" title="Ideas with a little more depth." copy="A closer look at five projects with the clearest technical stories in the public source." id="featured-title" /></motion.div>
      <div className="featured-grid">
        {featuredProjects.map((project, index) => (
          <motion.div className={`featured-cell featured-cell-${index + 1}`} key={project.id} initial={reduced ? false : { y: 14 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={reduced ? { duration: 0 } : { delay: index * 0.06, duration: 0.55, ease: easeOut }}>
            <ProjectCard project={project} featured />
          </motion.div>
        ))}
      </div>
      <a className="text-link featured-browse" href="#projects">Browse every verified project <ArrowRight size={15} /></a>
    </section>
  )
}

function AllProjects() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTechnology, setActiveTechnology] = useState('All technologies')
  const reduced = useReducedMotion()
  const technologies = useMemo(() => ['All technologies', ...new Set(projects.flatMap((project) => project.stack))], [])
  const headingReveal = useRevealProps()

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesCategory = activeCategory === 'All' || projectCategory(project) === activeCategory
      const searchText = [project.title, project.variant, project.status, project.description, ...project.stack].join(' ').toLowerCase()
      const matchesTechnology = activeTechnology === 'All technologies' || project.stack.includes(activeTechnology)
      return matchesCategory && matchesTechnology && (!term || searchText.includes(term))
    })
  }, [query, activeCategory, activeTechnology])

  return (
    <section className="section-wrap all-projects-section" id="projects" aria-labelledby="projects-title">
      <motion.div variants={reveal} {...headingReveal}><SectionHeading eyebrow="Project index" title="The full collection." copy="Search by project or technology, then filter by the kind of work. Each card opens an evidence-based project view." id="projects-title" /></motion.div>
      <div className="project-tools">
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <span className="visually-hidden">Search projects</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or technologies…" />
          {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear project search"><X size={15} /></button>}
        </label>
        <p className="results-count" role="status">{filteredProjects.length} <span>of {projects.length} projects</span></p>
      </div>
      <div className="filter-list" role="group" aria-label="Filter projects by category">
        {categories.map((category) => (
          <motion.button key={category} type="button" className={`filter-chip${activeCategory === category ? ' is-active' : ''}`} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.96 }} layout transition={spring}>{category}</motion.button>
        ))}
      </div>
      <label className="technology-filter">
        <span>TECHNOLOGY</span>
        <select aria-label="Filter projects by technology" value={activeTechnology} onChange={(event) => setActiveTechnology(event.target.value)}>
          {technologies.map((technology) => <option key={technology} value={technology}>{technology}</option>)}
        </select>
        <ChevronRight size={14} aria-hidden="true" />
      </label>
      {filteredProjects.length ? (
        <div className="projects-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProjects.map((project, index) => (
              <motion.div className="project-grid-item" key={project.id} layout initial={reduced ? false : { y: 14 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.12 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={reduced ? { duration: 0 } : { duration: 0.55, delay: index * 0.06, ease: easeOut }}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="empty-state"><Search size={22} /><h3>No matching projects</h3><p>Try another title, technology, or category.</p><button className="text-link-button" onClick={() => { setQuery(''); setActiveCategory('All'); setActiveTechnology('All technologies') }}>Reset search <ArrowRight size={15} /></button></div>
      )}
    </section>
  )
}

function SkillSection() {
  const revealProps = useRevealProps()
  const reduced = useReducedMotion()
  return (
    <section className="section-wrap skills-section" id="skills" aria-labelledby="skills-title">
      <motion.div variants={reveal} {...revealProps}><SectionHeading eyebrow="Tools I’ve used" title="Skills through the work." copy="Grouped from languages, manifests, and source code in the audited public repositories. No self-rated levels." id="skills-title" /></motion.div>
      <motion.div className="skills-grid" variants={stagger} {...revealProps}>
        {skills.map((group, index) => (
          <SceneItem key={group.title} index={index} total={skills.length}>
          <motion.article className="skill-group" variants={reveal} whileHover={reduced ? undefined : { y: -3, borderColor: 'rgba(155,232,210,.35)' }} transition={spring}>
            <div className="skill-group-head"><span>0{index + 1}</span><h3>{group.title}</h3></div>
            <div className="skill-pills">{group.items.map((item, chipIndex) => <SceneItem as="span" key={item} index={chipIndex} total={group.items.length}><motion.span whileHover={reduced ? undefined : { scale: 1.04, color: '#dce7e4' }} transition={spring}>{item}</motion.span></SceneItem>)}</div>
          </motion.article>
          </SceneItem>
        ))}
      </motion.div>
      <p className="small-note">Some technologies appear in prototypes or placeholder configurations; their presence does not imply a production deployment.</p>
    </section>
  )
}

function ResearchSection() {
  const revealProps = useRevealProps()
  const diagramRevealProps = useRevealProps(0.12)
  return (
    <section className="research-section" id="research" aria-labelledby="research-title">
      <div className="section-wrap research-inner">
        <motion.div className="research-copy" variants={reveal} {...revealProps}>
          <motion.div variants={reveal} {...revealProps}><SectionHeading eyebrow="Research & experiments" title="Exploring beyond the obvious." copy="The verified public project set contains one research-style experiment in progress. It is presented with its current evidence and its known gaps." id="research-title" /></motion.div>
          <div className="research-status"><span className="status-ring" /> Research prototype <span className="research-separator">/</span> no publication listed</div>
          <h3>YOLOv11 weed detection</h3>
          <p className="research-detail-label">OBJECTIVE</p>
          <p>Explore multi-scale feature extraction for detecting weeds across agricultural imagery, with a custom DSHGNetV2 backbone and weighted BiFPN-style fusion.</p>
          <p className="research-detail-label">AVAILABLE EVIDENCE</p>
          <p>The source defines a YOLO detection path and includes partial training logs through epoch 22. The dataset is not included and the configured local path is machine-specific.</p>
          <p className="research-detail-label">IMPLEMENTATION CHALLENGE</p>
          <p>YOLOv11 code combines a DSHGNetV2 feature backbone with weighted BiFPN-style fusion before the detection head. The repository includes partial training logs, but its dataset and reproducible training path are incomplete.</p>
          <a className="text-link" href="#project/yolo-weed-detection">Read the project notes <ArrowRight size={15} /></a>
        </motion.div>
        <motion.div className="research-diagram" variants={reveal} {...diagramRevealProps}><ProjectDiagram type="yolo" compact /></motion.div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const revealProps = useRevealProps()
  const education = portfolio.education
  return (
    <section className="section-wrap experience-section" id="experience" aria-labelledby="experience-title">
      <motion.div variants={reveal} {...revealProps}><SectionHeading eyebrow="Education & experience" title="Grounded in learning. Built through projects." copy="Education and collaboration from the verified public record. No employment or internship roles were verified in the audit." id="experience-title" /></motion.div>
      <motion.div className="experience-timeline" variants={stagger} {...revealProps}>
        {education.map((item, index) => (
          <SceneItem key={item.title} index={index} total={education.length}>
          <motion.article className="experience-card" variants={reveal} whileHover={{ borderColor: 'rgba(124,58,237,.3)', y: -3 }} transition={spring}>
            <div className="experience-marker"><span /></div>
          <div className="experience-main">
              <p className="experience-date">{item.label}</p>
              <h3>{item.title}</h3>
              <p className="experience-role">{item.detail}</p>
              <p>{index === 0 ? 'Computer Science and Engineering student at VIT Chennai.' : 'The project README lists Poojitha among four teammates. It documents a multi-page help-seeker and volunteer flow, with no individual contribution breakdown or competition result recorded.'}</p>
              {index === 1 && <a className="text-link" href="#project/eco-network">Explore the project <ArrowRight size={15} /></a>}
            </div>
            <span className="experience-index">{item.date}</span>
          </motion.article>
          </SceneItem>
        ))}
      </motion.div>
    </section>
  )
}

const interestSlides = portfolio.interests

function BeyondCodeSection() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const reduced = useReducedMotion()
  const revealProps = useRevealProps()
  const carouselRef = useRef(null)
  const carouselInView = useInView(carouselRef, { once: false, amount: 0.2 })
  const move = (step) => {
    setDirection(step)
    setActive((current) => (current + step + interestSlides.length) % interestSlides.length)
  }
  const dragEnd = (_, info) => {
    if (info.offset.x < -65) move(1)
    else if (info.offset.x > 65) move(-1)
  }
  const variants = {
    enter: (sign) => ({ opacity: 0, x: sign > 0 ? 64 : -64, rotate: sign > 0 ? 2 : -2, scale: 0.97 }),
    center: { opacity: 1, x: 0, rotate: 0, scale: 1 },
    exit: (sign) => ({ opacity: 0, x: sign > 0 ? -54 : 54, rotate: sign > 0 ? -1.5 : 1.5, scale: 0.98 }),
  }

  return (
    <section className="section-wrap beyond-section" id="beyond" aria-labelledby="beyond-title">
      <motion.div variants={reveal} {...revealProps}>
        <SectionHeading eyebrow="Beyond the code" title="Beyond the Code." copy="A few themes drawn from the projects and interests documented across this portfolio." id="beyond-title" />
      </motion.div>
      <div ref={carouselRef} className={`interest-carousel${carouselInView ? ' is-in-view' : ''}`} aria-roledescription="carousel" aria-label="Technical interests">
        <motion.div className="interest-side interest-side-previous" aria-hidden="true" animate={reduced ? undefined : { rotateY: 12 + (active % 2) * 2, rotateZ: -2, scale: 0.9, opacity: 0.48 }} transition={spring}><span>{interestSlides[(active + interestSlides.length - 1) % interestSlides.length].label}</span></motion.div>
        <div className="interest-card-stage">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.article
              className="interest-card"
              key={active}
              custom={direction}
              variants={variants}
              initial={reduced ? false : 'enter'}
              animate="center"
              exit={reduced ? { opacity: 0 } : 'exit'}
              transition={reduced ? { duration: 0 } : { ...spring }}
              drag={reduced ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              dragMomentum={false}
              onDragEnd={dragEnd}
              aria-live="polite"
            >
              <div className="interest-card-top"><span>0{active + 1} / 0{interestSlides.length}</span><span>{interestSlides[active].mark}</span></div>
              <p className="eyebrow"><span className="eyebrow-dot" />{interestSlides[active].label}</p>
              <h3>{interestSlides[active].title}</h3>
              <p className="interest-copy">{interestSlides[active].copy}</p>
              <a href={`#project/${interestSlides[active].projectId}`} className="text-link" data-cursor="EXPLORE">Explore {interestSlides[active].projectName} <ArrowRight size={15} /></a>
              <div className="interest-orbit" aria-hidden="true"><span /><span /></div>
            </motion.article>
          </AnimatePresence>
        </div>
        <motion.div className="interest-side interest-side-next" aria-hidden="true" animate={reduced ? undefined : { rotateY: -12 - (active % 2) * 2, rotateZ: 2, scale: 0.9, opacity: 0.48 }} transition={spring}><span>{interestSlides[(active + 1) % interestSlides.length].label}</span></motion.div>
      </div>
      <div className="interest-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous technical interest"><ArrowLeft size={16} /></button>
        <div className="interest-dots" role="group" aria-label="Choose a technical interest">
          {interestSlides.map((slide, index) => <button key={slide.mark} type="button" aria-label={`Show ${slide.label.toLowerCase()}`} aria-current={index === active ? 'true' : undefined} onClick={() => { setDirection(index > active ? 1 : -1); setActive(index) }} />)}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Next technical interest"><ArrowRight size={16} /></button>
        <span className="interest-swipe-hint">Swipe to explore</span>
      </div>
    </section>
  )
}

function ContactSection() {
  const [copied, setCopied] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const revealProps = useRevealProps()

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setCopyMessage('Email address copied to clipboard.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyMessage('Copy is unavailable here. Select the email address above.')
    }
  }

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="section-wrap contact-inner">
        <motion.div className="contact-copy" variants={stagger} {...revealProps}>
          <p className="eyebrow"><span className="eyebrow-dot" /> Get in touch</p>
          <motion.h2 id="contact-title" variants={reveal}>Have an idea?<br />Let’s build something meaningful.</motion.h2>
          <motion.p variants={reveal}>I’m interested in thoughtful software, AI applications, and research opportunities. Reach out and tell me what you’re building.</motion.p>
          <MagneticLink variants={reveal} className="button button-primary contact-email" href={`mailto:${EMAIL}`} data-cursor="SAY HELLO">Start a conversation <ArrowUpRight size={16} /></MagneticLink>
          <button className="copy-email" type="button" onClick={copyAddress} aria-live="polite"><Copy size={14} />{copied ? 'Email copied' : 'Copy email address'}</button>
          <span className="copy-feedback" role="status">{copyMessage}</span>
        </motion.div>
        <motion.div className="contact-links" variants={stagger} {...revealProps}>
          <SceneItem index={0} total={3}><motion.a href={`mailto:${EMAIL}`} className="contact-link" variants={reveal} data-cursor="EMAIL"><span className="contact-icon"><Mail size={17} /></span><span><small>EMAIL</small><b>{EMAIL}</b></span><ArrowUpRight size={15} /></motion.a></SceneItem>
          <SceneItem index={1} total={3}><motion.a href={GITHUB} {...safeExternalProps()} className="contact-link" variants={reveal} data-cursor="GITHUB"><span className="contact-icon"><Github size={17} /></span><span><small>GITHUB</small><b>poojithasudalagunta-source</b></span><ArrowUpRight size={15} /></motion.a></SceneItem>
          <SceneItem index={2} total={3}><motion.a href={LINKEDIN} {...safeExternalProps()} className="contact-link" variants={reveal} data-cursor="LINKEDIN"><span className="contact-icon"><BriefcaseBusiness size={17} /></span><span><small>LINKEDIN</small><b>Connect professionally</b></span><ArrowUpRight size={15} /></motion.a></SceneItem>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-wrap footer-panel">
        <div className="footer-panel-top">
          <div className="footer-intro">
            <a className="footer-brand" href="#top">{portfolio.brand}<span>.</span></a>
            <p>{portfolio.bio}</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <div><span>EXPLORE</span><a href="#top">Home</a><a href="#about">About</a><a href="#featured">Featured projects</a><a href="#projects">All projects</a><a href="#research">Research</a><a href="#skills">Skills</a></div>
            <div><span>FEATURED WORK</span><a href="#project/smart-pantry-mobile">Smart Pantry</a><a href="#project/mediquery-ai">MediQuery AI</a><a href="#project/personaldock">PersonalDock</a><a href="#project/yolo-weed-detection">YOLOv11 Research</a></div>
            <div><span>ELSEWHERE</span><a href={GITHUB} {...safeExternalProps()}>GitHub <ArrowUpRight size={12} /></a><a href={LINKEDIN} {...safeExternalProps()}>LinkedIn <ArrowUpRight size={12} /></a><a href={`mailto:${EMAIL}`}>Email <ArrowUpRight size={12} /></a></div>
          </nav>
        </div>
        <div className="footer-panel-bottom"><span>Built with care, evidence, and a little curiosity.</span><span>© {new Date().getFullYear()} {portfolio.name}</span></div>
      </div>
      <div className="footer-wordmark-wrap" aria-hidden="true">
        <div className="footer-wordmark">POOJITHA</div>
      </div>
    </footer>
  )
}

function ProjectDiagram({ type, compact = false, steps }) {
  const reduced = useReducedMotion()
  const customSteps = steps || {
    smartpantry: ['Expo application', 'Pantry and recipe services', 'Candidate scoring', 'Constrained Groq plan'],
    personaldock: ['Browser pages', 'JSON HTTP requests', 'Express routes', 'Mongoose / MongoDB'],
    mediquery: ['Flutter clients', 'Dart API service', 'Express routes', 'MongoDB'],
    eco: ['Help request', 'Volunteer view', 'Accept / decline', 'Follow-up'],
    yolo: ['Input image', 'DSHGNetV2', 'Weighted BiFPN', 'YOLO head'],
    support: ['Query', 'Intent routing', 'Department node', 'Local documents / memory'],
    hospital: ['Browser chat', 'Flask endpoint', 'Keyword rules', 'Appointment data'],
    mailer: ['Scheduled run', 'LeetCode lookup', 'Explanation step', 'Email delivery'],
  }[type] || steps || ['Browser interface', 'Application logic', 'Data service']
  const count = customSteps.length

  return (
    <div className={`architecture-visual${compact ? ' architecture-visual-compact' : ''}`} aria-label="Project architecture flow">
      <div className="architecture-top"><span>IMPLEMENTATION FLOW</span><span>0{customSteps.length} STEPS</span></div>
      <div className="architecture-flow">
        <svg className="architecture-connectors architecture-connectors-horizontal" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
          {customSteps.slice(0, -1).map((step, index) => {
            const from = ((index + 0.5) / count) * 100
            const to = ((index + 1.5) / count) * 100
            return <motion.path key={`${step}-connector`} d={`M ${from} 10 L ${to} 10`} initial={reduced ? false : { pathLength: 0, opacity: 0.4 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={reduced ? { duration: 0 } : { duration: 0.8, delay: index * 0.16, ease: easeOut }} />
          })}
        </svg>
        <svg className="architecture-connectors architecture-connectors-vertical" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true">
          {customSteps.slice(0, -1).map((step, index) => {
            const from = ((index + 0.5) / count) * 100
            const to = ((index + 1.5) / count) * 100
            return <motion.path key={`${step}-mobile-connector`} d={`M 10 ${from} L 10 ${to}`} initial={reduced ? false : { pathLength: 0, opacity: 0.4 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={reduced ? { duration: 0 } : { duration: 0.8, delay: index * 0.16, ease: easeOut }} />
          })}
        </svg>
        {customSteps.map((step, index) => (
          <motion.div className="architecture-step" key={`${index}-${step}`} initial={reduced ? false : { opacity: 0.55, y: 8 }} whileInView={{ opacity: 1, y: 0, borderColor: ['#2c3541', 'rgba(155,232,210,.45)', '#2c3541'] }} viewport={{ once: true }} transition={reduced ? { duration: 0 } : { duration: 0.65, delay: index * 0.14, ease: easeOut }}>
            <span className="step-number">0{index + 1}</span>
            <b>{step}</b>
            {index < customSteps.length - 1 && <ChevronRight className="step-arrow" size={17} aria-hidden="true" />}
          </motion.div>
        ))}
      </div>
      <div className="architecture-bottom"><span className="architecture-pulse" /> Evidence-based system sketch</div>
    </div>
  )
}

function DetailImage({ project }) {
  const reduced = useReducedMotion()
  return (
    <motion.figure className="detail-figure" initial={reduced ? false : { opacity: 0, y: 20, clipPath: 'inset(0 0 12% 0)' }} whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }} viewport={{ once: true, amount: 0.18 }} transition={reduced ? { duration: 0 } : { duration: 0.75, ease: easeOut }}>
      <div className="detail-image-frame"><img src={project.image} alt={project.imageAlt} loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /></div>
      <figcaption>{project.imageCaption}</figcaption>
    </motion.figure>
  )
}

function ProjectDetails({ project }) {
  const reduced = useReducedMotion()
  const sectionReveal = useRevealProps()
  if (!project) {
    return (
      <main className="section-wrap not-found">
        <p className="eyebrow"><span className="eyebrow-dot" /> Project index</p>
        <h1>That project isn’t in this collection.</h1>
        <a className="button button-primary" href="#projects">Return to all projects <ArrowLeft size={16} /></a>
      </main>
    )
  }

  const Icon = projectIcons[project.icon] || Layers3
  const jumpToCaseSection = (event, id) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }
  return (
    <main className="case-study">
      <div className="section-wrap case-wrap">
        <a className="back-link" href="#projects"><ArrowLeft size={15} /> Back to all projects</a>
        <div className="case-hero">
          <div className="case-intro">
            <div className="case-kicker"><span className="case-icon"><Icon size={16} /></span>{project.variant}</div>
            <h1>{project.title}</h1>
            <p className="case-description">{project.description}</p>
            <div className="case-status"><span />{project.status}</div>
            <div className="case-actions"><a className="button button-primary" href={project.repository} {...safeExternalProps()}>View source on GitHub <Github size={15} /></a></div>
          </div>
          <div className="case-artwork"><ProjectVisual project={project} /></div>
        </div>

        <div className="case-meta-grid">
          <div><span>PROJECT TYPE</span><b>{project.variant}</b></div>
          <div><span>STATUS</span><b>{project.status}</b></div>
          <div className="case-tech"><span>TECHNOLOGIES</span><div className="tag-row">{project.stack.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div></div>
        </div>

        <div className="case-content-grid">
          <aside className="case-toc" aria-label="On this page"><span>ON THIS PAGE</span><a href="#case-context" onClick={(event) => jumpToCaseSection(event, 'case-context')}>Context</a><a href="#case-build" onClick={(event) => jumpToCaseSection(event, 'case-build')}>Implementation</a><a href="#case-flow" onClick={(event) => jumpToCaseSection(event, 'case-flow')}>Technical flow</a></aside>
          <div className="case-content">
            <motion.section className="case-section" id="case-context" variants={reveal} {...sectionReveal}>
              <p className="eyebrow"><span className="eyebrow-dot" /> 01 / Context</p>
              <div className="context-grid"><div><h2>The problem</h2><p>{project.problem}</p></div><div><h2>The approach</h2><p>{project.solution}</p></div></div>
            </motion.section>
            {project.image && <DetailImage project={project} />}
            {project.extraImages?.length > 0 && (
              <div className="detail-gallery">
                {project.extraImages.map((image, index) => <motion.figure key={image.src} initial={reduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={reduced ? { duration: 0 } : { ...spring, delay: index * 0.1 }}><img src={image.src} alt={image.alt} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.hidden = true }} /><figcaption>Repository feature artwork</figcaption></motion.figure>)}
              </div>
            )}
            <motion.section className="case-section case-implementation" id="case-build" variants={reveal} {...sectionReveal}>
              <p className="eyebrow"><span className="eyebrow-dot" /> 02 / Implementation</p>
              <h2>What the source shows.</h2>
              <ul className="implementation-list">{project.implementation.map((item) => <li key={item}><Check size={15} /><span>{item}</span></li>)}</ul>
              {project.boundary && <div className="boundary-note"><span>PROJECT NOTE</span><p>{project.boundary}</p></div>}
            </motion.section>
            <motion.section className="case-section" id="case-flow" variants={reveal} {...sectionReveal}>
              <p className="eyebrow"><span className="eyebrow-dot" /> 03 / Technical flow</p>
              <h2>How the pieces connect.</h2>
              {project.diagram ? <ProjectDiagram type={project.diagram} steps={project.architecture} /> : <ProjectDiagram type={project.id === 'smart-pantry-mobile' ? 'smartpantry' : project.id === 'personaldock' ? 'personaldock' : ''} steps={project.architecture} />}
            </motion.section>
            <div className="case-end-links"><a className="button button-primary" href={project.repository} {...safeExternalProps()}>Open GitHub repository <ExternalLink size={15} /></a><a className="text-link" href="#projects">Explore more projects <ArrowRight size={15} /></a></div>
          </div>
        </div>
      </div>
    </main>
  )
}

function HomePage() {
  return (
    <main>
      <Scene className="scene-hero"><Hero /></Scene>
      <Scene className="scene-about"><About /></Scene>
      <FeaturedProjects />
      <AllProjects />
      <Scene className="scene-skills"><SkillSection /></Scene>
      <ResearchSection />
      <Scene className="scene-education"><ExperienceSection /></Scene>
      <BeyondCodeSection />
      <Scene className="scene-contact"><ContactSection /></Scene>
    </main>
  )
}

function WorkspaceStart({ onFinish }) {
  const [activeRail, setActiveRail] = useState('More')
  const [selected, setSelected] = useState('Open the project folder')
  const railItems = [
    ['Images', Layers3],
    ['History', Clock3],
    ['Library', BookOpen],
    ['Explore', Network],
    ['More', MoreHorizontal],
  ]
  const groups = [
    { name: 'intro', tasks: ['Open the project folder'] },
    { name: 'toc', tasks: ['Clone and edit the project', 'Fill ICAROB 2027 registration PDF'] },
    { name: 'samsung pro', tasks: ['Complete ICAROB 2027 registration', 'Fill ICAROB 2027 registration PDF', 'Review ConvFill presentation'] },
    { name: 'grandpa-ai', tasks: ['Stabilize Phase 2A database and auth'] },
  ]

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onFinish() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onFinish])

  return (
    <motion.div className="brand-intro codex-start" role="dialog" aria-modal="true" aria-labelledby="codex-start-title" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3, ease: easeOut } }}>
      <nav className="start-rail" aria-label="Main navigation">
        {railItems.map(([label, Icon]) => (
          <button key={label} className={`start-rail-button${activeRail === label ? ' is-active' : ''}`} aria-label={label} title={label} onClick={() => setActiveRail(label)}>
            <Icon size={27} strokeWidth={1.8} />
          </button>
        ))}
      </nav>
      <aside className="start-sidebar" aria-label="Chats and projects">
        <button className="start-new-chat" type="button" onClick={() => setSelected('New chat')}>
          <SquarePen size={23} strokeWidth={1.8} /><span>New chat</span>
        </button>
        <div className="start-sidebar-scroll">
          <section className="start-section start-pinned">
            <h2>Pinned</h2>
            <button className={`start-chat-row${selected === 'AI Support Automation Design' ? ' is-selected' : ''}`} onClick={() => setSelected('AI Support Automation Design')}>AI Support Automation Design</button>
          </section>
          <section className="start-section start-projects">
            <h2>Projects</h2>
            {groups.map((group) => (
              <div className="start-project-group" key={group.name}>
                <button className="start-project-name" onClick={() => setSelected(group.name)}><FolderOpen size={24} strokeWidth={1.8} /><span>{group.name}</span></button>
                {group.tasks.map((task) => (
                  <button key={`${group.name}-${task}`} className={`start-task-row${selected === task ? ' is-selected' : ''}`} onClick={() => setSelected(task)}>{task}</button>
                ))}
              </div>
            ))}
            <button className="start-open-portfolio" onClick={onFinish}>Open Poojitha’s portfolio <ArrowUpRight size={15} /></button>
          </section>
        </div>
      </aside>
      <section className="start-main-pane" aria-label="Workspace preview">
        <header className="start-main-header"><span className="start-mark">P<span>.</span></span><span>Workspace</span></header>
        <div className="start-main-content">
          <p id="codex-start-title">PROJECT SPACE</p>
          <h1>{selected}</h1>
          <span>Your projects and conversations, all in one place.</span>
          <button onClick={onFinish}>Open the portfolio <ArrowUpRight size={15} /></button>
        </div>
      </section>
    </motion.div>
  )
}
export default function App() {
  const projectId = useRoute()
  const project = projects.find((entry) => entry.id === projectId)
  const reduced = useReducedMotion()
  const [showIntro, setShowIntro] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try { return window.sessionStorage.getItem('portfolio-intro-seen-v3') !== 'true' } catch { return true }
  })

  useEffect(() => {
    if (!showIntro) return
    try { window.sessionStorage.setItem('portfolio-intro-seen-v3', 'true') } catch { /* Session storage is optional. */ }
  }, [showIntro])

  return (
    <MotionSystem>
      <AnimatePresence>{showIntro && <WorkspaceStart key="workspace-start" onFinish={() => setShowIntro(false)} />}</AnimatePresence>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Navbar detail={Boolean(projectId)} />
      <ScrollProgress />
      <div id="main-content">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={projectId || 'home'} className="route-scene" initial={reduced ? false : { opacity: 0.96, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 1 } : { opacity: 0, y: -3, transition: { duration: 0.08, ease: easeOut } }} transition={reduced ? { duration: 0 } : { duration: 0.25, ease: easeOut }}>
            {projectId ? <ProjectDetails project={project} /> : <HomePage />}
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
      <CustomCursor />
    </MotionSystem>
  )
}

