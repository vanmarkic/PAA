# Radix UI Component Library

This directory contains a complete set of Radix UI components with Tailwind CSS styling. All components are built on top of Radix UI primitives for accessibility and functionality.

## Available Components

### 1. **Accordion** (`accordion.tsx`)
Collapsible content sections with expand/collapse functionality.
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>
```

### 2. **Alert** (`alert.tsx`)
Display important messages and notifications.
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app using the cli.</AlertDescription>
</Alert>
```

### 3. **Alert Dialog** (`alert-dialog.tsx`)
Modal dialog for important confirmations.
```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 4. **Aspect Ratio** (`aspect-ratio.tsx`)
Maintain consistent aspect ratios for media elements.
```tsx
import { AspectRatio } from '@/components/ui/aspect-ratio';

<AspectRatio ratio={16 / 9}>
  <img src="..." alt="Image" className="rounded-md object-cover" />
</AspectRatio>
```

### 5. **Avatar** (`avatar.tsx`)
User profile images with fallback support.
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

### 6. **Badge** (`badge.tsx`)
Small status indicators and labels.
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="outline">Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### 7. **Breadcrumb** (`breadcrumb.tsx`)
Navigation path indicators.
```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### 8. **Button** (`button.tsx`)
Interactive button elements with multiple variants.
```tsx
import { Button } from '@/components/ui/button';

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconComponent /></Button>
```

### 9. **Calendar** (`calendar.tsx`)
Date picker calendar component.
```tsx
import { Calendar } from '@/components/ui/calendar';

const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

### 10. **Card** (`card.tsx`)
Container components for grouped content.
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>
```

### 11. **Carousel** (`carousel.tsx`)
Image/content slider with navigation.
```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### 12. **Chart** (`chart.tsx`)
Chart components for data visualization (requires recharts).
```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

<ChartContainer config={chartConfig}>
  {/* Chart content */}
  <ChartTooltip content={<ChartTooltipContent />} />
</ChartContainer>
```

### 13. **Checkbox** (`checkbox.tsx`)
Checkbox input with label support.
```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms and conditions</label>
```

### 14. **Collapsible** (`collapsible.tsx`)
Expandable/collapsible content sections.
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

<Collapsible>
  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects.
  </CollapsibleContent>
</Collapsible>
```

### 15. **Command** (`command.tsx`)
Command palette for search and actions.
```tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### 16. **Context Menu** (`context-menu.tsx`)
Right-click context menus.
```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Profile</ContextMenuItem>
    <ContextMenuItem>Settings</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### 17. **Dialog** (`dialog.tsx`)
Modal dialog windows.
```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description goes here.</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### 18. **Drawer** (`drawer.tsx`)
Slide-out drawer panels.
```tsx
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

<Drawer>
  <DrawerTrigger>Open Drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description.</DrawerDescription>
    </DrawerHeader>
    {/* Drawer content */}
    <DrawerFooter>
      <DrawerClose>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### 19. **Dropdown Menu** (`dropdown-menu.tsx`)
Dropdown menu with items and sub-menus.
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 20. **Form** (`form.tsx`)
Form components with react-hook-form integration.
```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

<Form {...form}>
  <FormField
    control={form.control}
    name="username"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input placeholder="shadcn" {...field} />
        </FormControl>
        <FormDescription>This is your public display name.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### 21. **Hover Card** (`hover-card.tsx`)
Information cards that appear on hover.
```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

<HoverCard>
  <HoverCardTrigger>Hover over me</HoverCardTrigger>
  <HoverCardContent>
    Additional information appears here.
  </HoverCardContent>
</HoverCard>
```

### 22. **Input** (`input.tsx`)
Text input fields.
```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled input" />
```

### 23. **Input OTP** (`input-otp.tsx`)
One-time password input fields.
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
</InputOTP>
```

### 24. **Label** (`label.tsx`)
Form field labels.
```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### 25. **Menubar** (`menubar.tsx`)
Application menu bars.
```tsx
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from '@/components/ui/menubar';

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab</MenubarItem>
      <MenubarItem>New Window</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### 26. **Navigation Menu** (`navigation-menu.tsx`)
Main navigation menus.
```tsx
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/docs">Documentation</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### 27. **Pagination** (`pagination.tsx`)
Page navigation controls.
```tsx
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### 28. **Popover** (`popover.tsx`)
Floating content panels.
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger>Open popover</PopoverTrigger>
  <PopoverContent>
    Place content for the popover here.
  </PopoverContent>
</Popover>
```

### 29. **Progress** (`progress.tsx`)
Progress indicator bars.
```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={33} />
<Progress value={66} className="w-[60%]" />
```

### 30. **Radio Group** (`radio-group.tsx`)
Radio button groups.
```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>
```

### 31. **Resizable** (`resizable.tsx`)
Resizable panel layouts.
```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel>Panel 1</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Panel 2</ResizablePanel>
</ResizablePanelGroup>
```

### 32. **Scroll Area** (`scroll-area.tsx`)
Custom scrollable containers.
```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  {/* Long content here */}
</ScrollArea>
```

### 33. **Select** (`select.tsx`)
Select dropdown menus.
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

### 34. **Separator** (`separator.tsx`)
Visual dividers between content.
```tsx
import { Separator } from '@/components/ui/separator';

<div>
  <div>Content above</div>
  <Separator />
  <div>Content below</div>
</div>
```

### 35. **Sheet** (`sheet.tsx`)
Side panel overlays.
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger>Open Sheet</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description goes here.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### 36. **Sidebar** (`sidebar.tsx`)
Application sidebar navigation.
```tsx
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '@/components/ui/sidebar';

<Sidebar>
  <SidebarHeader>Header</SidebarHeader>
  <SidebarContent>
    <SidebarGroup>Group content</SidebarGroup>
  </SidebarContent>
  <SidebarFooter>Footer</SidebarFooter>
</Sidebar>
```

### 37. **Skeleton** (`skeleton.tsx`)
Loading placeholder animations.
```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

### 38. **Slider** (`slider.tsx`)
Range slider inputs.
```tsx
import { Slider } from '@/components/ui/slider';

<Slider defaultValue={[50]} max={100} step={1} />
<Slider defaultValue={[25, 75]} max={100} step={1} />
```

### 39. **Sonner** (`sonner.tsx`)
Toast notifications (requires sonner library).
```tsx
import { toast } from 'sonner';

// Trigger toasts
toast('Event has been created')
toast.success('Successfully saved!')
toast.error('Failed to save')
toast.warning('Warning message')
```

### 40. **Switch** (`switch.tsx`)
Toggle switches.
```tsx
import { Switch } from '@/components/ui/switch';

<Switch id="airplane-mode" />
<Label htmlFor="airplane-mode">Airplane Mode</Label>
```

### 41. **Table** (`table.tsx`)
Data tables with headers and rows.
```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell>$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 42. **Tabs** (`tabs.tsx`)
Tabbed content sections.
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content here.</TabsContent>
  <TabsContent value="password">Password content here.</TabsContent>
</Tabs>
```

### 43. **Textarea** (`textarea.tsx`)
Multi-line text input.
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Type your message here." />
<Textarea disabled placeholder="Disabled textarea" />
```

### 44. **Toggle** (`toggle.tsx`)
Toggle button states.
```tsx
import { Toggle } from '@/components/ui/toggle';

<Toggle>Toggle Me</Toggle>
<Toggle variant="outline">Outline</Toggle>
```

### 45. **Toggle Group** (`toggle-group.tsx`)
Groups of toggle buttons.
```tsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

<ToggleGroup type="single">
  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
  <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
</ToggleGroup>
```

### 46. **Tooltip** (`tooltip.tsx`)
Hover tooltips for additional information.
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover over me</TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Utility Files

### **utils.ts**
Utility function for combining class names using clsx and tailwind-merge.
```tsx
import { cn } from '@/components/ui/utils';

<div className={cn("base-classes", conditional && "conditional-classes", className)} />
```

### **use-mobile.ts**
React hook for detecting mobile devices.
```tsx
import { useIsMobile } from '@/components/ui/use-mobile';

const isMobile = useIsMobile();
```

## Figma Components

### **ImageWithFallback** (`figma/ImageWithFallback.tsx`)
Image component with fallback support for missing images.
```tsx
import ImageWithFallback from '@/components/figma/ImageWithFallback';

<ImageWithFallback
  src="/path/to/image.jpg"
  fallbackSrc="/path/to/fallback.jpg"
  alt="Description"
/>
```

## Installation & Setup

All components are ready to use. They require:
- React 18+
- Radix UI packages (specified in each component)
- Tailwind CSS with appropriate configuration
- class-variance-authority for variant styling

## Import Pattern

All components follow a consistent import pattern:
```tsx
import { ComponentName } from '@/components/ui/component-name';
```

## Styling

Components use Tailwind CSS classes and CSS variables for theming. Configure your `tailwind.config.js` with the appropriate theme values for:
- Colors (primary, secondary, destructive, muted, accent, etc.)
- Border radius
- Font sizes
- Shadows
- Animations

## Accessibility

All components are built on Radix UI primitives which follow WAI-ARIA guidelines for accessibility, including:
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

## TypeScript Support

All components are fully typed with TypeScript, providing:
- IntelliSense support
- Type safety
- Prop validation
- Auto-completion