# 4.2.2 Interview Findings

This section presents the findings from two interviews conducted with industry professionals to gather user requirements and technical insights for the Smart Funeral Management System. The interviews aimed to identify current practices in funeral service operations, challenges faced by service providers, and technical best practices for system development.

An interview session was conducted with **Tan Ming Jiun**, a Service Advisor at Nirvana Asia, through an online video conference platform (Google Meet) on [Date]. This interview aimed to gather user requirements for the proposed system from a funeral service provider's perspective, focusing on operational workflows, customer interaction patterns, and industry-specific needs.

Additionally, another interview session was conducted with **Tan Kwan Yang**, a Software Engineer at GRAB Malaysia, through Google Meet on [Date]. The objective of this interview was to gather technical requirements and software development best practices from an experienced software engineer's perspective, focusing on system architecture, scalability considerations, and modern web development approaches that could enhance the Smart Funeral Management System.

The key findings from both interviews can be divided into three categories: current practices in funeral service operations, problems encountered during funeral service operations, and user needs and preferences (combining both operational and technical perspectives). A summarized overview of the interview findings is presented below.

## i. Current Practices in Funeral Service Operations

a. **Service Booking Process**: Clients typically contact funeral service providers through phone calls or walk-in visits to inquire about available packages and pricing. Initial consultations are conducted in person or over the phone, where service advisors explain package details, add-on services, and pricing structures.

b. **Package Presentation**: Service providers maintain physical brochures and price lists showcasing different funeral packages (Basic, Standard, Premium) with varying service inclusions. Buddhist ceremony add-ons are often presented as separate offerings, requiring manual explanation of each service category.

c. **Booking Confirmation**: Once a package is selected, clients fill out physical forms with personal information, deceased person details, and service preferences. Booking confirmations are typically provided through phone calls or printed receipts.

d. **Payment Processing**: Payments are primarily processed through cash, bank transfers, or credit card payments at the service provider's office. Payment receipts are issued manually, and payment tracking relies on physical records or basic spreadsheet systems.

e. **Service Coordination**: Communication between service providers and clients occurs primarily through phone calls and WhatsApp messages. Service providers manually track service dates, availability, and coordinate with various vendors (monks, caterers, transportation) through phone calls.

f. **Memorial Management**: Families often create physical memorial boards or use social media platforms to share information about funeral services. Guest attendance is tracked through manual RSVP lists or verbal confirmations.

g. **Document Management**: Important documents such as death certificates, booking forms, and service agreements are stored in physical files. Document retrieval requires manual searching through filing systems.

## ii. Problems Encountered During Funeral Service Operations

a. **Limited Online Presence**: Many funeral service providers lack comprehensive online platforms, making it difficult for families to browse packages, compare prices, and make informed decisions without visiting physical locations.

b. **Manual Booking Management**: Service providers struggle with manual booking tracking systems, leading to potential double-bookings, scheduling conflicts, and difficulty managing availability across multiple service dates.

c. **Inefficient Communication**: Heavy reliance on phone calls and WhatsApp creates communication bottlenecks, especially during peak periods. Families may experience delays in receiving responses to inquiries or booking confirmations.

d. **Limited Package Visibility**: Without an online catalog, families cannot easily compare packages from different providers, limiting their ability to make informed decisions during emotionally difficult times.

e. **Add-on Service Complexity**: The extensive range of Buddhist ceremony add-ons (49+ services across 9 categories) makes it challenging to present all options clearly to families, often leading to confusion or missed service opportunities.

f. **Availability Management**: Service providers face difficulties managing their availability calendars, especially when coordinating multiple bookings, staff schedules, and vendor availability. Unavailable dates are often communicated verbally, leading to potential booking conflicts.

g. **Payment Tracking**: Manual payment records make it difficult to generate financial reports, track revenue trends, and manage refunds or cancellations systematically.

h. **Guest Management**: Tracking RSVP responses and guest attendance for funeral services relies on manual methods, making it challenging to estimate attendance numbers and coordinate logistics.

i. **Memorial Accessibility**: Physical memorial boards have limited accessibility, and families often struggle to share memorial information with distant relatives or friends who cannot attend in person.

j. **Document Storage and Retrieval**: Physical document storage systems make it time-consuming to retrieve booking information, service agreements, or historical records when needed.

## iii. User Needs and Preferences

### Operational Needs (Service Provider Perspective)

a. **Centralized Booking System**: Service providers need a centralized platform to manage all bookings, view upcoming services, track booking statuses, and generate booking reports efficiently.

b. **Availability Calendar**: An interactive calendar system that allows providers to mark dates as available or unavailable, with automatic exclusion from booking options when dates are marked unavailable.

c. **Package Management**: Providers require tools to create, edit, and manage funeral packages with features such as pricing, descriptions, images, and active/inactive status toggles.

d. **Add-on Service Customization**: Providers need the ability to customize their Buddhist add-on offerings, either by adopting system templates or creating custom services, with pricing flexibility to remain competitive.

e. **Customer Communication**: Automated email notifications for booking confirmations, payment receipts, and service reminders would reduce manual communication workload.

f. **Analytics and Reporting**: Providers need dashboard analytics showing total bookings, revenue trends, average ratings, and monthly performance metrics to make informed business decisions.

g. **Review Management**: A system to view and respond to customer reviews and ratings, helping providers understand service quality and areas for improvement.

h. **Document Management**: Digital storage and retrieval of booking documents, death certificates, and service agreements would streamline administrative processes.

### Technical Requirements (Software Engineer Perspective)

a. **Modern Technology Stack**: The system should utilize modern web technologies (React.js, Next.js, TypeScript) for maintainable, scalable code that follows industry best practices and enables future enhancements.

b. **API Architecture**: A well-structured RESTful API architecture that separates frontend and backend concerns, enabling independent scaling and easier integration with third-party services (payment gateways, AI services).

c. **Database Design**: Proper database normalization (3NF), strategic indexing for performance, and comprehensive foreign key relationships to ensure data integrity and efficient query execution.

d. **Security Implementation**: Robust authentication using JWT tokens, password hashing (bcrypt), role-based access control, and input validation to protect sensitive customer and business data.

e. **Responsive Design**: Mobile-first responsive design ensuring the system is accessible and functional across all devices (desktop, tablet, mobile), as families may access the system from various devices during difficult times.

f. **Performance Optimization**: Code splitting, lazy loading, and efficient database queries to ensure fast page load times and smooth user experience, especially important during high-traffic periods.

g. **Error Handling**: Comprehensive error handling with user-friendly error messages, proper logging for debugging, and graceful degradation when external services (payment gateways, AI APIs) are unavailable.

h. **Testing Strategy**: Automated testing scripts for regression testing, unit testing for individual components, and integration testing to ensure features work together seamlessly, maintaining code quality during rapid development cycles.

i. **Scalability Considerations**: Database connection pooling, caching strategies, and modular architecture that allows the system to handle increased load as more providers and customers use the platform.

j. **User Experience (UX) Design**: Intuitive navigation, clear visual hierarchy, and grief-sensitive design principles that acknowledge the emotional context of users while maintaining professional functionality.

k. **Integration Capabilities**: Well-designed API endpoints that enable future integrations with external services such as payment gateways (FPX, e-Wallet), email notification systems, and AI services (grief counseling, voice memorial).

l. **Code Maintainability**: Clean code practices, consistent naming conventions, comprehensive documentation, and modular component structure that enables future developers to understand and extend the system efficiently.

---

**Note**: Both interviews provided valuable insights from different perspectives. Tan Ming Jiun's expertise in funeral service operations helped identify real-world operational challenges and user needs specific to the funeral industry. Tan Kwan Yang's software engineering experience provided technical guidance on modern development practices, system architecture, and scalability considerations that would enhance the system's robustness and maintainability. The combination of domain expertise and technical expertise ensured that the system addresses both operational requirements and technical best practices.

