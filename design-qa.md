# Design QA

- Source visual truth: `assets/zhishu-app-reference.png`
- Implementation screenshot: `qa/desktop-paper-full.png`
- Focused comparison: `qa/editor-comparison.png`
- Viewport: 1536 x 695 CSS pixels, DPR 1.25
- State: Windows download configured; ink and paper themes tested; link completion selected

**Full-View Comparison Evidence**

The full desktop page preserves the approved editorial hierarchy: graph-led hero, alternating Write/Connect/See chapters, centered studio statement, and a compact download footer. The ink and paper captures use the specified `#15121e` and `#f3ede2` foundations without horizontal overflow.

**Focused Region Comparison Evidence**

The side-by-side editor comparison verifies the visible product language against the supplied Windows screenshot. Both use a compact title bar, Chinese application menus, a dense formatting toolbar, document tabs, a large writing canvas, and a bottom status strip. The landing-page implementation intentionally shows a populated Markdown document rather than the source welcome screen because this section demonstrates writing capability.

**Findings**

- No actionable P0/P1/P2 findings.
- Fonts and typography: Noto Serif SC carries display headlines; Noto Sans SC/Inter carry body copy; JetBrains Mono carries navigation, labels, metadata, and code-like content. Hierarchy and wrapping are consistent in the tested desktop viewport.
- Spacing and layout rhythm: the desktop sections alternate correctly, use consistent chapter spacing, and have no horizontal overflow. Dedicated tablet and mobile media queries switch the chapters to a single column and stack the CTAs.
- Colors and visual tokens: ink/paper backgrounds and neutral text colors match the brief. Purple, orange, and blue remain concentrated in graph nodes, link affordances, and interaction feedback.
- Image quality and asset fidelity: both supplied logos are used from source assets. The editor reference remains sharp, and the product logo is used as its existing SVG asset.
- Copy and content: all primary Chinese copy is user-centered; all download entries use one shared configuration and show version/file size consistently.
- Interaction states: theme switching, active download configuration, `[[` completion, suggestion selection, focus affordances, scrolled navigation, and reduced-motion behavior are implemented.

**Patches Made Since Previous QA Pass**

- Converted landing-page copy to valid UTF-8 after the first structural test exposed literal escape sequences.
- Verified the real archive path and synchronized both download entries from `config/download.json`.

**Implementation Checklist**

- [x] Desktop ink theme
- [x] Desktop paper theme
- [x] Download configuration and archive response
- [x] Keyboard-visible focus styles
- [x] Interactive link completion
- [x] Reduced-motion fallback
- [x] Tablet and mobile single-column rules

**Follow-up Polish**

- A physical narrow Chrome window was not available through the controlled browser surface, so mobile and tablet rules were verified from their explicit breakpoint CSS rather than a device-toolbar screenshot.

final result: passed
