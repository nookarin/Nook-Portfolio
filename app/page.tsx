export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="Nook home">N<span>/</span></a>
        <div className="nav-links"><a href="#about">About</a><a href="#projects">Work</a><a href="#contact">Contact</a></div>
        <a className="availability" href="#contact"><i /> Available for work</a>
      </nav>
      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">FULL-STACK DEVELOPER · BANGKOK</p>
          <h1>I build digital<br />products that<br /><em>just work.</em></h1>
          <p className="intro">Thoughtful interfaces, resilient systems, and the clean code that connects them.</p>
          <a className="work-link" href="#projects">Explore selected work <span aria-hidden="true">↘</span></a>
        </div>
        <div className="terminal-wrap" aria-label="Developer profile terminal">
          <div className="terminal-shadow" />
          <div className="terminal">
            <div className="terminal-bar"><div className="dots"><span /><span /><span /></div><p>nook@portfolio: ~</p><span className="terminal-menu">•••</span></div>
            <div className="terminal-body">
              <p><b className="prompt">nook@dev</b><b className="path">:~$</b> whoami</p><p className="output">Nook — Full-Stack Developer</p>
              <p><b className="prompt">nook@dev</b><b className="path">:~$</b> cat focus.txt</p><p className="output">Building accessible, fast, human-centered<br />web experiences from database to pixel.</p>
              <p><b className="prompt">nook@dev</b><b className="path">:~$</b> ls skills/</p><p className="skills-line"><span>typescript</span><span>react</span><span>node</span><span>postgres</span><span>docker</span><span>cloud</span></p>
              <p><b className="prompt">nook@dev</b><b className="path">:~$</b> status</p><p className="output status"><i /> Open to new opportunities</p>
              <p><b className="prompt">nook@dev</b><b className="path">:~$</b> <span className="cursor" /></p>
            </div>
          </div>
        </div>
      </section>
      <section className="ticker" aria-label="Core skills"><div>REACT <span>✦</span> TYPESCRIPT <span>✦</span> NODE.JS <span>✦</span> POSTGRESQL <span>✦</span> DOCKER <span>✦</span> AWS <span>✦</span> NEXT.JS <span>✦</span> REST APIs</div></section>
      <section className="about shell" id="about"><p className="section-kicker">01 / ABOUT</p><div><h2>Engineering with<br /><em>purpose.</em></h2><p>I’m a full-stack developer who cares about the details — from the shape of an API response to the feel of a button. I turn complex problems into clear, maintainable products people enjoy using.</p></div></section>
      <section className="projects shell" id="projects">
        <div className="section-head"><p className="section-kicker">02 / SELECTED WORK</p><h2>Built to solve<br /><em>real problems.</em></h2></div>
        <div className="project-grid">
          <article className="project featured"><div className="project-number">01</div><div className="project-visual commerce"><span>ORDER #4182</span><strong>฿ 2,480</strong><div><i /><i /><i /></div></div><div className="project-copy"><p>COMMERCE · 2026</p><h3>MarketFlow</h3><span>Multi-vendor commerce platform with real-time inventory, payments, and an operations dashboard.</span><div className="tags"><b>Next.js</b><b>Node.js</b><b>PostgreSQL</b></div><a href="#">View case study ↗</a></div></article>
          <article className="project"><div className="project-number">02</div><div className="project-visual metrics"><span>API HEALTH</span><strong>99.98%</strong><div className="bars"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="project-copy"><p>DEVELOPER TOOLS · 2025</p><h3>Pulseboard</h3><span>Observability workspace that turns service metrics into clear, actionable signals.</span><div className="tags"><b>React</b><b>TypeScript</b><b>Go</b></div><a href="#">View case study ↗</a></div></article>
          <article className="project"><div className="project-number">03</div><div className="project-visual teams"><span>TEAM SPACE</span><strong>12 active</strong><div className="avatars"><i>N</i><i>K</i><i>M</i><i>+9</i></div></div><div className="project-copy"><p>COLLABORATION · 2025</p><h3>Orbit</h3><span>A focused project hub for distributed teams, from kickoff to confident delivery.</span><div className="tags"><b>React</b><b>Express</b><b>WebSockets</b></div><a href="#">View case study ↗</a></div></article>
        </div>
      </section>
      <section className="toolbox shell"><p className="section-kicker">03 / TOOLBOX</p><div><h2>From interface<br />to infrastructure.</h2><div className="skill-groups"><div><p>FRONTEND</p><span>React / Next.js</span><span>TypeScript</span><span>Tailwind CSS</span><span>Accessibility</span></div><div><p>BACKEND</p><span>Node.js / Express</span><span>PostgreSQL</span><span>REST / GraphQL</span><span>Authentication</span></div><div><p>DEVOPS</p><span>Docker</span><span>AWS / Cloudflare</span><span>CI / CD</span><span>Testing</span></div></div></div></section>
      <section className="certs shell"><p className="section-kicker">04 / CERTIFICATES</p><div className="cert-list"><div><b>01</b><span><strong>AWS Certified Cloud Practitioner</strong><small>Amazon Web Services · 2026</small></span><i>↗</i></div><div><b>02</b><span><strong>Meta Front-End Developer</strong><small>Meta · 2025</small></span><i>↗</i></div><div><b>03</b><span><strong>JavaScript Algorithms & Data Structures</strong><small>freeCodeCamp · 2025</small></span><i>↗</i></div></div></section>
      <section className="contact" id="contact"><div className="shell"><p className="section-kicker">05 / CONTACT</p><h2>Have a problem<br />worth solving?</h2><a className="email-link" href="mailto:hello@example.com">hello@example.com <span>↗</span></a><div className="contact-bottom"><p>Based in Bangkok · Available worldwide</p><div><a href="#">GitHub ↗</a><a href="#">LinkedIn ↗</a><a href="#">Download CV ↓</a></div></div></div></section>
      <footer className="quick-footer shell"><p>Nook / Full-Stack Developer</p><p>© 2026 · Built with care & caffeine.</p></footer>
    </main>
  );
}
