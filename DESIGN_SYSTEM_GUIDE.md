# 🎨 Design System - Guia de Referência Rápida

## 🎯 Classes Utilitárias Customizadas

### Backgrounds & Gradients
```jsx
className="page-gradient"        // Gradiente de página (light/dark aware)
className="card-gradient"        // Gradiente sutil para cards
className="primary-gradient"     // Gradiente primary com hover
className="glass"                // Glassmorphism effect
className="glass-card"           // Glass + rounded + shadow
```

### Animações
```jsx
className="animate-fade-in"      // Fade in suave com movimento Y
className="animate-slide-in-right"  // Desliza da direita
className="animate-slide-in-left"   // Desliza da esquerda
className="animate-scale-in"     // Scale com fade
className="animate-shimmer"      // Shimmer effect (loading)
```

### Hover Effects
```jsx
className="hover-lift"           // Eleva (-translate-y-1) + shadow-lg
className="hover-scale"          // Scale 105%
className="hover-glow"           // Shadow colorida
```

### Transitions
```jsx
className="smooth-transition"    // transition-all 300ms ease-in-out
className="smooth-color"         // transition-colors 200ms ease-in-out
```

### Focus States
```jsx
className="focus-ring"           // Ring com offset
className="focus-visible-ring"   // Ring apenas com keyboard
```

### Scrollbar
```jsx
className="custom-scrollbar"     // Scrollbar estilizada
```

### Grid Utilities
```jsx
className="grid-auto-fit"        // Auto-fit minmax(250px, 1fr)
className="grid-auto-fill"       // Auto-fill minmax(250px, 1fr)
```

---

## 🎨 Paleta de Cores

### Backgrounds
```css
bg-background                    // Fundo principal
bg-card                          // Cards e surfaces
bg-popover                       // Popovers e dropdowns
```

### Text
```css
text-foreground                  // Texto principal
text-muted-foreground            // Texto secundário/subtle
```

### Primary
```css
bg-primary                       // Cor primária (indigo)
text-primary                     // Texto primário
border-primary                   // Border primária
```

### Secondary
```css
bg-secondary                     // Cor secundária (slate-100/700)
text-secondary-foreground        // Texto em secondary
```

### Status
```css
bg-success / text-success        // Verde (emerald)
bg-warning / text-warning        // Amarelo (amber)
bg-error / text-error            // Vermelho (red)
bg-info / text-info              // Azul (blue)
bg-destructive                   // Vermelho destrutivo
```

### Borders
```css
border-border                    // Border padrão (slate-200/700)
border-input-border              // Border de inputs (slate-300/600)
```

---

## 📏 Espaçamento

### Sistema de Spacing
```css
p-[spacing-xs]    // 8px
p-[spacing-sm]    // 12px
p-[spacing-md]    // 16px
p-[spacing-lg]    // 24px
p-[spacing-xl]    // 32px
p-[spacing-2xl]   // 48px
```

### Padrões de Uso
```jsx
// Cards
className="p-6 lg:p-8"

// Modal
className="p-6 sm:p-8"

// Form spacing
className="space-y-5"

// Grid gaps
className="gap-6"
```

---

## 🔘 Border Radius

```css
rounded-[radius-sm]      // 8px
rounded-[radius-md]      // 12px (padrão)
rounded-[radius-lg]      // 16px
rounded-[radius-xl]      // 24px

// Ou use Tailwind padrão:
rounded-xl               // 12px (usado em cards)
rounded-2xl              // 16px (usado em containers)
rounded-3xl              // 24px (usado em modals)
```

---

## 🌑 Shadows

```jsx
// Light
shadow-sm                // Sutil
shadow-md                // Médio
shadow-lg                // Grande
shadow-xl                // Extra grande
shadow-2xl               // Massive

// Com hover
className="shadow-sm hover:shadow-lg"

// Coloridas
className="hover:shadow-xl hover:shadow-indigo-500/30"
```

---

## 📝 Tipografia

### Headings
```jsx
<h1>  // text-4xl lg:text-5xl font-semibold
<h2>  // text-3xl lg:text-4xl font-semibold
<h3>  // text-2xl lg:text-3xl font-semibold
<h4>  // text-xl lg:text-2xl font-semibold
<h5>  // text-lg lg:text-xl font-semibold
<h6>  // text-base lg:text-lg font-semibold
```

### Body Text
```jsx
className="text-sm"              // 14px
className="text-base"            // 16px (padrão)
className="text-lg"              // 18px
```

### Font Weights
```jsx
className="font-medium"          // Labels
className="font-semibold"        // Sub-titles
className="font-bold"            // Titles, emphasis
```

---

## 🔧 Componentes - Uso Recomendado

### Input
```jsx
<Input
  id="email"
  label="E-mail"
  icon={<IconMail />}
  type="email"
  placeholder="seu@email.com"
  value={value}
  onChange={onChange}
  required
  error={errorMessage}              // Opcional
  helperText="Texto de ajuda"       // Opcional
  disabled={false}                  // Opcional
/>
```

### Button
```jsx
<Button
  type="submit"
  variant="primary"                 // primary, secondary, destructive, ghost, outline, success
  size="md"                         // sm, md, lg
  fullWidth={true}
  loading={isLoading}
  disabled={false}
  icon={<IconCheck />}
  iconPosition="left"               // left, right
  onClick={handleClick}
>
  Texto do Botão
</Button>
```

### Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  maxWidth="md"                     // sm, md, lg, xl, 2xl
>
  <h2>Título do Modal</h2>
  <p>Conteúdo...</p>
</Modal>
```

### StatCard
```jsx
<StatCard
  icon={<IconCalendar size={24} />}
  title="Título da Métrica"
  value="123"
  change="+12%"
  changeType="positive"             // positive, negative
/>
```

---

## 📱 Responsividade

### Breakpoints Tailwind
```css
sm:   // 640px
md:   // 768px
lg:   // 1024px
xl:   // 1280px
2xl:  // 1536px
```

### Padrões de Uso
```jsx
// Grid responsivo
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

// Padding responsivo
className="p-6 lg:p-8"

// Text responsivo
className="text-3xl lg:text-4xl"

// Flex responsivo
className="flex flex-col sm:flex-row gap-4"
```

---

## 🎭 Dark Mode

### Aplicação
```jsx
// Sempre use pares light/dark
className="bg-white dark:bg-slate-800"
className="text-slate-900 dark:text-white"
className="border-slate-200 dark:border-slate-700"

// Hover também
className="hover:bg-slate-50 dark:hover:bg-slate-700"
```

### Toggle Dark Mode (se necessário)
```jsx
// No ThemeContext ou similar:
const { theme, toggleTheme } = useTheme();

// Aplicar no <html>:
<html className={theme === 'dark' ? 'dark' : ''}>
```

---

## ✨ Padrões de Composição

### Card Pattern
```jsx
<div className="
  bg-white dark:bg-slate-800
  p-6 lg:p-8
  rounded-2xl
  shadow-sm hover:shadow-lg
  border border-slate-200 dark:border-slate-700
  smooth-transition
  hover-lift
">
  {/* Conteúdo */}
</div>
```

### Form Pattern
```jsx
<form className="space-y-5">
  <Input {...props1} />
  <Input {...props2} />
  <Button type="submit" fullWidth>Enviar</Button>
</form>
```

### Grid de Cards
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

### Container com Header
```jsx
<div className="space-y-8">
  <div>
    <h1 className="text-4xl font-bold mb-2">Título</h1>
    <p className="text-slate-500 dark:text-slate-400">Subtítulo</p>
  </div>
  
  {/* Conteúdo */}
</div>
```

---

## 🚀 Dicas de Performance

1. **Use `smooth-transition` ao invés de `transition-all`** quando possível
2. **Prefira `smooth-color`** para transições apenas de cor
3. **Evite animar `height`** - use `max-height` ou `scale`
4. **Use `will-change`** com moderação
5. **Prefira transforms** (`translate`, `scale`) a `top`/`left`

---

## 📖 Exemplos Práticos

### Botão com Loading
```jsx
<Button loading={isSubmitting} variant="primary" fullWidth>
  {isSubmitting ? 'Enviando...' : 'Enviar'}
</Button>
```

### Input com Error
```jsx
<Input
  error={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Card Interativo
```jsx
<div className="
  hover-lift
  hover-glow
  smooth-transition
  cursor-pointer
  bg-white dark:bg-slate-800
  p-6 rounded-2xl
  border border-slate-200 dark:border-slate-700
">
  Clique aqui
</div>
```

---

**💡 Dica Final:** Sempre teste suas mudanças em light e dark mode!
