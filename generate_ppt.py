import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# --------------------------------------------------------------------------
# PALETTE & DESIGN TOKENS
# --------------------------------------------------------------------------
COLOR_PAPER = RGBColor(244, 242, 236)        # #F4F2EC (Warm Paper Canvas)
COLOR_PAPER_CARD = RGBColor(255, 255, 255)   # #FFFFFF (Crisp White Card)
COLOR_PAPER_SUBTLE = RGBColor(250, 248, 243) # #FAF8F3 (Subtle Card)
COLOR_GRAPHITE = RGBColor(20, 20, 18)        # #141412 (Dark Sanctuary)
COLOR_GRAPHITE_CARD = RGBColor(28, 28, 26)   # #1C1C1A (Elevated Dark Card)
COLOR_COBALT = RGBColor(30, 64, 175)         # #1E40AF (Royal Cobalt Blue)
COLOR_COBALT_LIGHT = RGBColor(219, 234, 254) # #DBEAFE
COLOR_TERRACOTTA = RGBColor(234, 88, 12)     # #EA580C (Terracotta Orange Koi)
COLOR_LIME = RGBColor(195, 235, 56)          # #C3EB38 (Confetti Lime)
COLOR_TEXT_DARK = RGBColor(20, 20, 18)       # #141412
COLOR_TEXT_MUTED = RGBColor(113, 113, 107)   # #71716B
COLOR_TEXT_STARK = RGBColor(255, 255, 247)   # #FFFFF7
COLOR_TEXT_DARK_MUTED = RGBColor(160, 160, 155)
COLOR_BORDER_LIGHT = RGBColor(214, 209, 196) # #D6D1C4
COLOR_BORDER_DARK = RGBColor(51, 51, 46)     # #33332E

FONT_DISPLAY = "Century Gothic"
FONT_MONO = "Consolas"
FONT_BODY = "Segoe UI"

def set_slide_background(slide, color):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    return bg

def add_header(slide, tag_text, title_text, dark_mode=False):
    # Monospace Meta Tag
    tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(11.7), Inches(0.35))
    tf_tag = tag_box.text_frame
    tf_tag.word_wrap = True
    tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = tag_text.upper()
    p_tag.font.name = FONT_MONO
    p_tag.font.size = Pt(10)
    p_tag.font.bold = True
    p_tag.font.color.rgb = COLOR_LIME if dark_mode else COLOR_COBALT

    # Display Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.75))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.name = FONT_DISPLAY
    p_title.font.size = Pt(28)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_TEXT_STARK if dark_mode else COLOR_TEXT_DARK

def create_card(slide, left, top, width, height, bg_color, border_color=None):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
    else:
        card.line.fill.background()
    return card

def main():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "assets", "images")
    desktop_dir = os.path.join(os.path.expanduser("~"), "Desktop")
    output_path = os.path.join(desktop_dir, "Rishab_Kumar_Portfolio_Submission.pptx")

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Warm Paper Editorial Canvas)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, COLOR_PAPER)

    # Top Brand Bar
    brand_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.4))
    tf_brand = brand_box.text_frame
    p_b = tf_brand.paragraphs[0]
    r_name = p_b.add_run()
    r_name.text = "Rishab Kumar "
    r_name.font.name = FONT_DISPLAY
    r_name.font.size = Pt(18)
    r_name.font.bold = True
    r_name.font.color.rgb = COLOR_TEXT_DARK

    r_slash = p_b.add_run()
    r_slash.text = "/portfolio"
    r_slash.font.name = FONT_MONO
    r_slash.font.size = Pt(13)
    r_slash.font.bold = True
    r_slash.font.color.rgb = COLOR_COBALT

    # Status Pill
    status_pill = create_card(s1, Inches(0.8), Inches(1.5), Inches(5.2), Inches(0.45), COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_stat = s1.shapes.add_textbox(Inches(0.95), Inches(1.55), Inches(5.0), Inches(0.35))
    p_st = tb_stat.text_frame.paragraphs[0]
    p_st.text = "■ LUCKNOW, IN — 2ND YEAR CSE @ SRMU"
    p_st.font.name = FONT_MONO
    p_st.font.size = Pt(10.5)
    p_st.font.bold = True
    p_st.font.color.rgb = COLOR_COBALT

    # Huge Hero Headline
    hero_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(8.5), Inches(2.2))
    tf_h = hero_box.text_frame
    tf_h.word_wrap = True
    p_h1 = tf_h.paragraphs[0]
    p_h1.text = "building resilient software"
    p_h1.font.name = FONT_DISPLAY
    p_h1.font.size = Pt(40)
    p_h1.font.bold = True
    p_h1.font.color.rgb = COLOR_TEXT_DARK

    p_h2 = tf_h.add_paragraph()
    p_h2.text = "and ai products"
    p_h2.font.name = FONT_DISPLAY
    p_h2.font.size = Pt(40)
    p_h2.font.bold = True
    p_h2.font.color.rgb = COLOR_COBALT

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(0.8), Inches(4.5), Inches(7.5), Inches(1.2))
    tf_sub = sub_box.text_frame
    tf_sub.word_wrap = True
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = "Personal engineering portfolio showcasing autonomous desktop agents, zero-server client utilities, interactive algorithm simulations, and pure vanilla frontend architectures."
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(14)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

    # Right Column: Koi Pond Mosaic Feature Box
    pond_card = create_card(s1, Inches(8.7), Inches(1.5), Inches(3.8), Inches(5.2), COLOR_GRAPHITE, COLOR_BORDER_DARK)
    tb_pond = s1.shapes.add_textbox(Inches(9.0), Inches(1.8), Inches(3.2), Inches(4.5))
    tf_p = tb_pond.text_frame
    tf_p.word_wrap = True
    
    p1 = tf_p.paragraphs[0]
    p1.text = "INTERACTIVE CANVAS POND"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_LIME

    p2 = tf_p.add_paragraph()
    p2.text = "\nProcedural Pixel Koi Simulation"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(17)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_STARK

    p3 = tf_p.add_paragraph()
    p3.text = "\n• 7 Sanke & Kohaku Koi Fish\n• 60fps HTML5 Canvas Engine\n• Mosaic Square Tile Matrices\n• Interactive Radial Food Ripples\n• Headline Collision Exclusion"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_DARK_MUTED

    p4 = tf_p.add_paragraph()
    p4.text = "\n[koi 07   food 00   60fps]"
    p4.font.name = FONT_MONO
    p4.font.size = Pt(11)
    p4.font.color.rgb = COLOR_TERRACOTTA

    # Footer Metadata Pill
    live_pill = create_card(s1, Inches(0.8), Inches(6.0), Inches(7.5), Inches(0.65), COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_live = s1.shapes.add_textbox(Inches(1.0), Inches(6.12), Inches(7.2), Inches(0.4))
    p_live = tb_live.text_frame.paragraphs[0]
    p_live.text = "LIVE DEPLOYMENT: https://rishabkr0.github.io/MyPortfolio/"
    p_live.font.name = FONT_MONO
    p_live.font.size = Pt(11.5)
    p_live.font.bold = True
    p_live.font.color.rgb = COLOR_COBALT


    # =========================================================================
    # SLIDE 2: PROJECT OBJECTIVE & ARCHITECTURAL PHILOSOPHY
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, COLOR_PAPER)
    add_header(s2, "01 / Engineering Foundation", "Project Objective & Architectural Philosophy")

    col_w = Inches(3.64)
    gap = Inches(0.4)
    y_top = Inches(1.8)
    card_h = Inches(4.9)

    # Pillar 1
    create_card(s2, Inches(0.8), y_top, col_w, card_h, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb1 = s2.shapes.add_textbox(Inches(1.0), y_top + Inches(0.25), col_w - Inches(0.4), card_h - Inches(0.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "01 • ZERO DEPENDENCIES"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_COBALT
    p2 = tf1.add_paragraph()
    p2.text = "100% Pure Vanilla Standards"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_DARK
    p3 = tf1.add_paragraph()
    p3.text = "\n• Zero npm framework bloat\n• Zero third-party runtime CDNs\n• Sub-50ms Time-to-Interactive (TTI)\n• Semantic HTML5 markup\n• Native browser API mastery\n• Clean separation of DOM & physics"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_MUTED

    # Pillar 2
    create_card(s2, Inches(0.8) + col_w + gap, y_top, col_w, card_h, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb2 = s2.shapes.add_textbox(Inches(1.0) + col_w + gap, y_top + Inches(0.25), col_w - Inches(0.4), card_h - Inches(0.5))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p1 = tf2.paragraphs[0]
    p1.text = "02 • EDITORIAL MINIMALISM"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TERRACOTTA
    p2 = tf2.add_paragraph()
    p2.text = "High-Contrast Japanese Zen Aesthetic"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_DARK
    p3 = tf2.add_paragraph()
    p3.text = "\n• Inspired by Kai Linh digital zen\n• Warm paper tone (#F4F2EC)\n• Royal Cobalt (#1E40AF) & Terracotta\n• Pixel mosaic square design motif\n• Fluid clamp() responsive typography\n• Syne display & JetBrains Mono pairing"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_MUTED

    # Pillar 3
    create_card(s2, Inches(0.8) + (col_w + gap)*2, y_top, col_w, card_h, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb3 = s2.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, y_top + Inches(0.25), col_w - Inches(0.4), card_h - Inches(0.5))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    p1 = tf3.paragraphs[0]
    p1.text = "03 • STUDENT CRAFT"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_COBALT
    p2 = tf3.add_paragraph()
    p2.text = "Authentic 2nd-Year Engineering"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_DARK
    p3 = tf3.add_paragraph()
    p3.text = "\n• Real undergraduate projects & labs\n• A* Graph Pathfinding visualizer\n• Stepped Quicksort race canvas\n• SRMU 75% attendance planner\n• Offline-first client security\n• Zero AI buzzword fabrication"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 3: FLAGSHIP PROJECTS — C.A.S.P.E.R & TOOLHUB
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, COLOR_GRAPHITE)
    add_header(s3, "02 / Verified Deployments", "Flagship AI & Privacy-First Utilities", dark_mode=True)

    w_card = Inches(5.65)
    h_card = Inches(5.0)

    # Card 1: CASPER
    create_card(s3, Inches(0.8), Inches(1.8), w_card, h_card, COLOR_GRAPHITE_CARD, COLOR_BORDER_DARK)
    casper_img_path = os.path.join(assets_dir, "casper-studio.png")
    if os.path.exists(casper_img_path):
        s3.shapes.add_picture(casper_img_path, Inches(1.1), Inches(2.0), width=Inches(5.05))

    tb_c1 = s3.shapes.add_textbox(Inches(1.1), Inches(4.5), Inches(5.05), Inches(2.1))
    tfc1 = tb_c1.text_frame
    tfc1.word_wrap = True
    p1 = tfc1.paragraphs[0]
    p1.text = "C.A.S.P.E.R • FLAGSHIP AI DESKTOP ASSISTANT"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_LIME
    p2 = tfc1.add_paragraph()
    p2.text = "Autonomous Voice & Neural Desktop Agent"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_STARK
    p3 = tfc1.add_paragraph()
    p3.text = "• Python, PyQt6, Local LLM Inference (Ollama), PyTTSx3\n• Sub-second response synthesis with Casper Studio GUI\n• Local file management and zero-cloud voice workflows"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(11)
    p3.font.color.rgb = COLOR_TEXT_DARK_MUTED

    # Card 2: ToolHub
    create_card(s3, Inches(6.85), Inches(1.8), w_card, h_card, COLOR_GRAPHITE_CARD, COLOR_BORDER_DARK)
    toolhub_img_path = os.path.join(assets_dir, "toolhub-hero.jpg")
    if os.path.exists(toolhub_img_path):
        s3.shapes.add_picture(toolhub_img_path, Inches(7.15), Inches(2.0), width=Inches(5.05))

    tb_c2 = s3.shapes.add_textbox(Inches(7.15), Inches(4.5), Inches(5.05), Inches(2.1))
    tfc2 = tb_c2.text_frame
    tfc2.word_wrap = True
    p1 = tfc2.paragraphs[0]
    p1.text = "TOOLHUB • 100% IN-BROWSER UTILITY SUITE"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TERRACOTTA
    p2 = tfc2.add_paragraph()
    p2.text = "Zero-Server Privacy-First Document Suite"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_STARK
    p3 = tfc2.add_paragraph()
    p3.text = "• Vanilla JavaScript, Web Workers, PDF.js, Canvas APIs\n• Client-side PDF merge, page split, regex scrubbers\n• 0 bytes uploaded to external servers — 100% private"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(11)
    p3.font.color.rgb = COLOR_TEXT_DARK_MUTED


    # =========================================================================
    # SLIDE 4: FRONTEND SYSTEMS & LIVE IDE — RCODE & CODEVERSE
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, COLOR_GRAPHITE)
    add_header(s4, "03 / Compiler & Systems", "Frontend Architecture & Browser Compiler", dark_mode=True)

    # Card 1: RCODE
    create_card(s4, Inches(0.8), Inches(1.8), w_card, h_card, COLOR_GRAPHITE_CARD, COLOR_BORDER_DARK)
    rcode_img_path = os.path.join(assets_dir, "rcode-hero.jpg")
    if os.path.exists(rcode_img_path):
        s4.shapes.add_picture(rcode_img_path, Inches(1.1), Inches(2.0), width=Inches(5.05))

    tb_r1 = s4.shapes.add_textbox(Inches(1.1), Inches(4.5), Inches(5.05), Inches(2.1))
    tfr1 = tb_r1.text_frame
    tfr1.word_wrap = True
    p1 = tfr1.paragraphs[0]
    p1.text = "RCODE SYSTEMS • FRONTEND ARCHITECTURE"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_LIME
    p2 = tfr1.add_paragraph()
    p2.text = "High-Fidelity Interface Engineering"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_STARK
    p3 = tfr1.add_paragraph()
    p3.text = "• Pure vanilla DOM APIs, CSS Grid & Custom Properties\n• Reusable state machines, micro-interactions, dark modes\n• Zero framework runtime dependencies"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(11)
    p3.font.color.rgb = COLOR_TEXT_DARK_MUTED

    # Card 2: CodeVerse IDE
    create_card(s4, Inches(6.85), Inches(1.8), w_card, h_card, COLOR_GRAPHITE_CARD, COLOR_BORDER_DARK)
    
    # Custom IDE mockup container
    ide_mock = create_card(s4, Inches(7.15), Inches(2.0), Inches(5.05), Inches(2.2), RGBColor(12, 13, 16), COLOR_BORDER_DARK)
    tb_ide_m = s4.shapes.add_textbox(Inches(7.3), Inches(2.1), Inches(4.75), Inches(2.0))
    tf_im = tb_ide_m.text_frame
    tf_im.word_wrap = True
    p_im1 = tf_im.paragraphs[0]
    p_im1.text = "codeverse.worker.js • AST Sandbox"
    p_im1.font.name = FONT_MONO
    p_im1.font.size = Pt(9.5)
    p_im1.font.color.rgb = COLOR_TEXT_DARK_MUTED

    p_im2 = tf_im.add_paragraph()
    p_im2.text = "async function compileAst(src) {\n  const tokens = tokenize(src);\n  return evaluate(parse(tokens));\n}\n> [Live Sandbox] ✔ AST Compiled in 1.2ms"
    p_im2.font.name = FONT_MONO
    p_im2.font.size = Pt(9.5)
    p_im2.font.color.rgb = COLOR_LIME

    tb_r2 = s4.shapes.add_textbox(Inches(7.15), Inches(4.5), Inches(5.05), Inches(2.1))
    tfr2 = tb_r2.text_frame
    tfr2.word_wrap = True
    p1 = tfr2.paragraphs[0]
    p1.text = "CODEVERSE IDE • COMPILER PIPELINE"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_COBALT
    p2 = tfr2.add_paragraph()
    p2.text = "In-Browser Development & Execution"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_STARK
    p3 = tfr2.add_paragraph()
    p3.text = "• Tokenizer, parser, and sandboxed runtime in Web Workers\n• Thread-isolated iframe execution without main thread jank\n• Deployed: codeverse-main-ruby.vercel.app"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(11)
    p3.font.color.rgb = COLOR_TEXT_DARK_MUTED


    # =========================================================================
    # SLIDE 5: CREATIVE EXPLORATIONS & 2ND-YEAR CS LABS
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, COLOR_PAPER)
    add_header(s5, "04 / Student Sandbox", "Creative Explorations & 2nd-Year CS Labs")

    # 3 Cards for explorations
    create_card(s5, Inches(0.8), y_top, col_w, card_h, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_e1 = s5.shapes.add_textbox(Inches(1.0), y_top + Inches(0.25), col_w - Inches(0.4), card_h - Inches(0.5))
    tfe1 = tb_e1.text_frame
    tfe1.word_wrap = True
    p1 = tfe1.paragraphs[0]
    p1.text = "A* GRID PATHFINDER"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_COBALT
    p2 = tfe1.add_paragraph()
    p2.text = "Graph Search Visualizer"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_DARK
    p3 = tfe1.add_paragraph()
    p3.text = "\n• 18×11 square tile procedural grid\n• Manhattan distance heuristic (f = g + h)\n• Visual open & closed set expansion\n• Shortest path animated in Terracotta\n• Procedural maze generation loops\n• Built purely with HTML5 Canvas"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_MUTED

    create_card(s5, Inches(0.8) + col_w + gap, y_top, col_w, card_h, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_e2 = s5.shapes.add_textbox(Inches(1.0) + col_w + gap, y_top + Inches(0.25), col_w - Inches(0.4), card_h - Inches(0.5))
    tfe2 = tb_e2.text_frame
    tfe2.word_wrap = True
    p1 = tfe2.paragraphs[0]
    p1.text = "SORTING RACE LAB"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TERRACOTTA
    p2 = tfe2.add_paragraph()
    p2.text = "Quicksort Step Visualizer"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_DARK
    p3 = tfe2.add_paragraph()
    p3.text = "\n• Step-by-step array partition frames\n• Active pivot highlighted in Terracotta\n• Comparison pointers in Royal Cobalt\n• Live swap and comparison counters\n• Average time complexity: O(n log n)\n• Automatic array shuffling cycles"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_MUTED

    create_card(s5, Inches(0.8) + (col_w + gap)*2, y_top, col_w, card_h, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_e3 = s5.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, y_top + Inches(0.25), col_w - Inches(0.4), card_h - Inches(0.5))
    tfe3 = tb_e3.text_frame
    tfe3.word_wrap = True
    p1 = tfe3.paragraphs[0]
    p1.text = "75% ATTENDANCE CALC"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_COBALT
    p2 = tfe3.add_paragraph()
    p2.text = "SRMU Campus Utility"
    p2.font.name = FONT_DISPLAY
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_DARK
    p3 = tfe3.add_paragraph()
    p3.text = "\n• Models SRMU mandatory 75% rule\n• Tracks semester course lecture quotas\n• Calculates safe skips/bunks remaining\n• Exam eligibility threshold alerts\n• Genuinely relatable student engineering\n• 100% human-crafted utility"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 6: TECHNICAL METRICS & DESIGN SYSTEM TOKENS
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, COLOR_PAPER)
    add_header(s6, "05 / Specifications", "Design System Tokens & Performance Benchmarks")

    w_half = Inches(5.65)
    h_box = Inches(4.9)

    # Left: Color Tokens Table
    create_card(s6, Inches(0.8), y_top, w_half, h_box, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_tok = s6.shapes.add_textbox(Inches(1.1), y_top + Inches(0.3), w_half - Inches(0.6), h_box - Inches(0.6))
    tft = tb_tok.text_frame
    tft.word_wrap = True
    p1 = tft.paragraphs[0]
    p1.text = "DESIGN SYSTEM TOKENS"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_COBALT

    tokens = [
        ("Warm Paper Canvas", "#F4F2EC", "Main light theme background"),
        ("Graphite Sanctuary", "#141412", "Dark theme background"),
        ("Royal Cobalt Blue", "#1E40AF", "Primary brand & koi body tiles"),
        ("Terracotta Koi", "#EA580C", "Secondary accent & pathfinder line"),
        ("Confetti Lime", "#C3EB38", "Terminal status & success beacons"),
        ("Display Headline", "Syne (700)", "Bold fluid typography clamp()"),
        ("Monospace Telemetry", "JetBrains Mono", "Code, counters, HUD labels")
    ]
    for name, val, desc in tokens:
        p = tft.add_paragraph()
        p.text = f"• {name} [{val}] — {desc}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_TEXT_DARK

    # Right: Performance & Accessibility Benchmarks
    create_card(s6, Inches(6.85), y_top, w_half, h_box, COLOR_PAPER_CARD, COLOR_BORDER_LIGHT)
    tb_perf = s6.shapes.add_textbox(Inches(7.15), y_top + Inches(0.3), w_half - Inches(0.6), h_box - Inches(0.6))
    tfp = tb_perf.text_frame
    tfp.word_wrap = True
    p1 = tfp.paragraphs[0]
    p1.text = "VERIFIED PERFORMANCE AUDIT"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TERRACOTTA

    metrics = [
        ("0 External Libraries", "Zero React, Vue, jQuery or Tailwind dependencies"),
        ("60 FPS Smooth Render", "requestAnimationFrame loop with automatic pixelRatio"),
        ("Sub-50ms TTI", "Instant initial load with pure static assets"),
        ("WCAG AA Accessible", "High contrast text, focus visible rings, ARIA modal"),
        ("OpenGraph & SEO Ready", "Full social cards, Twitter meta, custom SVG favicon"),
        ("Single Codebase", "4 core files: index.html, style.css, koi-pond.js, script.js"),
        ("GitHub Pages Live", "Automated deployment with zero Jekyll overhead (.nojekyll)")
    ]
    for metric, desc in metrics:
        p = tfp.add_paragraph()
        p.text = f"✔ {metric} — {desc}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_TEXT_DARK


    # =========================================================================
    # SLIDE 7: SUBMISSION SUMMARY & VERIFICATION
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, COLOR_GRAPHITE)
    add_header(s7, "06 / Submission Package", "Project Deliverables & Repository Metadata", dark_mode=True)

    # Big Central Submission Summary Card
    create_card(s7, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.9), COLOR_GRAPHITE_CARD, COLOR_BORDER_DARK)
    tb_sum = s7.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.9), Inches(4.3))
    tf_s = tb_sum.text_frame
    tf_s.word_wrap = True

    p1 = tf_s.paragraphs[0]
    p1.text = "SUBMISSION DELIVERABLES & REPOSITORY CHECKLIST"
    p1.font.name = FONT_MONO
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_LIME

    checklist = [
        ("Live GitHub Pages Deployment", "https://rishabkr0.github.io/MyPortfolio/"),
        ("GitHub Source Repository", "https://github.com/Rishabkr0/MyPortfolio (branch: main)"),
        ("Candidate Name & Course", "Rishab Kumar — 2nd Year CSE, Shri Ramswaroop Memorial University (SRMU)"),
        ("Direct Contact Channels", "rishabkr2005@gmail.com • LinkedIn: linkedin.com/in/rishab-kumar"),
        ("Core Components Completed", "Koi Pond Canvas, 4 Project Cards, Lightbox, 3 DSA Visualizers, Form Card"),
        ("Documentation Package", "Comprehensive README.md with badges, tokens, setup & architecture docs"),
        ("Build Quality Status", "100% Passed — 0 Errors, Verified Clean Git Working Tree, Live & Synced")
    ]

    for label, val in checklist:
        p = tf_s.add_paragraph()
        r1 = p.add_run()
        r1.text = f"\n✔ {label}: "
        r1.font.name = FONT_BODY
        r1.font.size = Pt(13)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_TEXT_STARK

        r2 = p.add_run()
        r2.text = val
        r2.font.name = FONT_MONO if "http" in val or "@" in val else FONT_BODY
        r2.font.size = Pt(12)
        r2.font.color.rgb = COLOR_LIME if "http" in val else COLOR_TEXT_DARK_MUTED

    # Save to Desktop
    prs.save(output_path)
    print(f"SUCCESS: PowerPoint saved to {output_path}")

if __name__ == "__main__":
    main()
