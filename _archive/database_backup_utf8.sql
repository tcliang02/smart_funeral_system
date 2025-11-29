-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: smart_funeral_system
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addon_categories`
--

DROP TABLE IF EXISTS `addon_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addon_categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addon_categories`
--

LOCK TABLES `addon_categories` WRITE;
/*!40000 ALTER TABLE `addon_categories` DISABLE KEYS */;
INSERT INTO `addon_categories` VALUES (1,'Buddhist Rituals & Ceremonies','Traditional Buddhist funeral ceremonies and rituals',1,'2025-10-23 05:10:38'),(2,'Altars & Religious Items','Buddhist altars, statues, and religious offerings',2,'2025-10-23 05:10:38'),(3,'Flowers & Offerings','Floral arrangements and traditional offerings for Buddhist ceremonies',3,'2025-10-23 05:10:38'),(4,'Urns & Caskets','Traditional urns and caskets suitable for Buddhist funerals',4,'2025-10-23 05:10:38'),(5,'Monks & Chanting Services','Buddhist monk services and sutra chanting ceremonies',5,'2025-10-23 05:10:38'),(6,'Memorial Items','Memorial plaques, tablets, and remembrance items',6,'2025-10-23 05:10:38'),(7,'Transportation','Hearse and family transportation services',7,'2025-10-23 05:10:38'),(8,'Cremation Services','Cremation and related services',8,'2025-10-23 05:10:38'),(9,'Food & Refreshments','Vegetarian meals and refreshments for funeral attendees',9,'2025-10-23 05:10:38');
/*!40000 ALTER TABLE `addon_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addon_templates`
--

DROP TABLE IF EXISTS `addon_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addon_templates` (
  `template_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `suggested_price` decimal(10,2) NOT NULL,
  `is_popular` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`template_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_popular` (`is_popular`),
  CONSTRAINT `addon_templates_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `addon_categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addon_templates`
--

LOCK TABLES `addon_templates` WRITE;
/*!40000 ALTER TABLE `addon_templates` DISABLE KEYS */;
INSERT INTO `addon_templates` VALUES (1,1,'7-Day Buddhist Prayer Ceremony','Traditional 7-day prayer ceremony conducted by monks with daily chanting sessions',2500.00,1,'2025-10-23 05:10:38'),(2,1,'49-Day Memorial Service','Complete 49-day memorial service with weekly prayer sessions',5000.00,1,'2025-10-23 05:10:38'),(3,1,'100-Day Memorial Service','Traditional 100-day memorial prayer ceremony',1500.00,0,'2025-10-23 05:10:38'),(4,1,'Three-Day Wake Ceremony','Three consecutive days of Buddhist wake ceremony with nightly chanting',1800.00,1,'2025-10-23 05:10:38'),(5,1,'Dharma Talk Service','Buddhist master provides dharma talk about life, death, and rebirth',800.00,0,'2025-10-23 05:10:38'),(6,1,'Merit Dedication Ceremony','Special ceremony to dedicate merit to the deceased for better rebirth',600.00,0,'2025-10-23 05:10:38'),(7,1,'Sutra Recitation Service','Professional recitation of Buddhist sutras for 2 hours',400.00,1,'2025-10-23 05:10:38'),(8,2,'Standard Buddhist Altar Setup','Basic altar setup with Buddha statue, incense holder, and candles',500.00,1,'2025-10-23 05:10:38'),(9,2,'Premium Buddhist Altar Setup','Elaborate altar with large Buddha statue, offerings table, and decorative items',1200.00,1,'2025-10-23 05:10:38'),(10,2,'Lotus Lamp Set (108 pcs)','Traditional set of 108 lotus lamps for blessing ceremony',350.00,1,'2025-10-23 05:10:38'),(11,2,'Incense and Candle Package','Premium incense sticks and ceremonial candles for 3-day ceremony',180.00,1,'2025-10-23 05:10:38'),(12,2,'Buddhist Scripture Set','Set of Buddhist sutras and prayer books for ceremony',250.00,0,'2025-10-23 05:10:38'),(13,2,'Rebirth Prayer Flags','Traditional Tibetan prayer flags for blessing the departed',120.00,0,'2025-10-23 05:10:38'),(14,3,'White Lotus Arrangement','Large white lotus flower arrangement symbolizing purity and enlightenment',450.00,1,'2025-10-23 05:10:38'),(15,3,'Yellow Chrysanthemum Wreath','Traditional yellow chrysanthemum wreath for Buddhist funeral',380.00,1,'2025-10-23 05:10:38'),(16,3,'Fresh Fruit Offering Platter','Traditional fruit offerings including apples, oranges, and bananas',150.00,1,'2025-10-23 05:10:38'),(17,3,'Vegetarian Food Offerings','Complete set of vegetarian food offerings for Buddhist ceremony',200.00,1,'2025-10-23 05:10:38'),(18,3,'White Rose and Lily Bouquet','Elegant white rose and lily arrangement',320.00,0,'2025-10-23 05:10:38'),(19,4,'Standard Ceramic Urn','Traditional ceramic urn with Buddhist symbol designs',350.00,1,'2025-10-23 05:10:38'),(20,4,'Premium Jade Urn','High-quality jade urn with intricate Buddhist carvings',1500.00,0,'2025-10-23 05:10:38'),(21,4,'Wooden Sandalwood Urn','Aromatic sandalwood urn with lotus carving',800.00,1,'2025-10-23 05:10:38'),(22,4,'Biodegradable Urn','Eco-friendly biodegradable urn for natural burial',280.00,0,'2025-10-23 05:10:38'),(23,4,'Cloisonn├⌐ Enamel Urn','Decorative cloisonn├⌐ urn with Buddhist motifs',950.00,0,'2025-10-23 05:10:38'),(24,4,'Crystal Memorial Urn','Modern crystal urn with LED lighting',680.00,1,'2025-10-23 05:10:38'),(25,5,'Single Monk Chanting (3 hours)','One Buddhist monk performs chanting ceremony for 3 hours',500.00,1,'2025-10-23 05:10:38'),(26,5,'Triple Monk Chanting Ceremony','Three monks perform traditional chanting ceremony',1200.00,1,'2025-10-23 05:10:38'),(27,5,'Full Monk Assembly (7 monks)','Seven monks perform elaborate chanting ceremony',2800.00,1,'2025-10-23 05:10:38'),(28,5,'Overnight Vigil with Monks','Monks perform overnight chanting vigil',1800.00,0,'2025-10-23 05:10:38'),(29,5,'Blessing and Purification Ritual','Special blessing and purification ceremony by senior monk',700.00,0,'2025-10-23 05:10:38'),(30,6,'Memorial Plaque (Wooden)','Engraved wooden memorial plaque with photo frame',280.00,1,'2025-10-23 05:10:38'),(31,6,'Memorial Plaque (Marble)','High-quality marble memorial plaque with custom engraving',550.00,1,'2025-10-23 05:10:38'),(32,6,'Ancestor Tablet','Traditional wooden ancestor tablet with red and gold lacquer',380.00,1,'2025-10-23 05:10:38'),(33,6,'Photo Frame Display Set','Set of 3 premium photo frames for memorial display',150.00,0,'2025-10-23 05:10:38'),(34,6,'Memory Book and Guest Register','Elegant memory book for guests to write condolences',120.00,1,'2025-10-23 05:10:38'),(35,6,'Digital Memorial USB','USB drive with photo slideshow and life story video',200.00,0,'2025-10-23 05:10:38'),(36,7,'Standard Hearse Service','Standard hearse transportation to funeral venue or crematorium',600.00,1,'2025-10-23 05:10:38'),(37,7,'Premium Luxury Hearse','Premium luxury hearse with floral decorations',1200.00,1,'2025-10-23 05:10:38'),(38,7,'Family Transportation (1 bus)','Air-conditioned bus for family and relatives (up to 40 passengers)',500.00,1,'2025-10-23 05:10:38'),(39,7,'VIP Car Service (3 cars)','Three luxury cars for immediate family members',800.00,0,'2025-10-23 05:10:38'),(40,8,'Standard Cremation Service','Basic cremation service with standard urn',1800.00,1,'2025-10-23 05:10:38'),(41,8,'Premium Cremation Package','Premium cremation with memorial urn and certificate',2500.00,1,'2025-10-23 05:10:38'),(42,8,'Witnessing Cremation Service','Family can witness cremation process in private viewing room',400.00,0,'2025-10-23 05:10:38'),(43,8,'Ash Scattering Ceremony','Professional ash scattering ceremony at sea or garden',600.00,0,'2025-10-23 05:10:38'),(44,8,'Columbarium Niche (1 year)','One year columbarium niche rental for urn storage',500.00,1,'2025-10-23 05:10:38'),(45,9,'Vegetarian Buffet (50 pax)','Complete vegetarian buffet for 50 guests',800.00,1,'2025-10-23 05:10:38'),(46,9,'Vegetarian Buffet (100 pax)','Complete vegetarian buffet for 100 guests',1500.00,1,'2025-10-23 05:10:38'),(47,9,'Tea and Refreshments','Tea, coffee, and light refreshments for wake attendees',250.00,1,'2025-10-23 05:10:38'),(48,9,'Premium Fruit Platter','Seasonal fruit platter for refreshments',180.00,0,'2025-10-23 05:10:38'),(49,9,'Traditional Vegetarian Set Menu','Individual vegetarian set meals for 30 guests',450.00,0,'2025-10-23 05:10:38');
/*!40000 ALTER TABLE `addon_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_addons`
--

DROP TABLE IF EXISTS `booking_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_addons` (
  `booking_addon_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` varchar(20) NOT NULL,
  `addon_name` varchar(255) NOT NULL,
  `addon_price` decimal(10,2) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  PRIMARY KEY (`booking_addon_id`),
  KEY `idx_booking` (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_addons`
--

LOCK TABLES `booking_addons` WRITE;
/*!40000 ALTER TABLE `booking_addons` DISABLE KEYS */;
INSERT INTO `booking_addons` VALUES (9,'1','Incense and Candle Package',180.00,1),(10,'1','Fresh Fruit Offering Platter',150.00,1),(20,'10','Incense and Candle Package',180.00,1),(21,'10','Fresh Fruit Offering Platter',150.00,1),(22,'10','White Lotus Arrangement',450.00,1),(23,'10','Vegetarian Food Offerings',200.00,1),(24,'11','Lotus Lamp Set (108 pcs)',350.00,1),(25,'11','Buddhist Scripture Set',250.00,1),(26,'11','Rebirth Prayer Flags',120.00,1),(27,'11','Premium Fruit Platter',180.00,1),(28,'12','White Rose and Lily Bouquet',320.00,1),(29,'12','Memory Book and Guest Register',120.00,1),(30,'13','Premium Flower Stand',280.00,1),(31,'13','Memorial Photo Display Board',150.00,1),(32,'13','Guest Condolence Book',80.00,1),(33,'13','Tea & Coffee Service',170.00,1),(34,'14','Grand Flower Arch',520.00,1),(35,'14','Professional Live Streaming',350.00,1),(36,'14','Traditional Music Ensemble',400.00,1),(37,'14','VIP Refreshment Package',600.00,1),(100,'100','White Rose Bouquet',150.00,1),(101,'100','Guest Book',50.00,1),(102,'100','Photo Frame Display',150.00,1),(103,'101','Flower Wreath',200.00,1),(104,'101','Tea Service',200.00,1),(105,'102','Grand Flower Arch',520.00,1),(106,'102','Professional Live Streaming',350.00,1),(107,'102','Memorial DVD',230.00,1),(108,'103','Memorial Program Booklet',150.00,1),(109,'103','Flower Stand',200.00,1),(110,'104','Condolence Book',100.00,1),(111,'104','White Lily Arrangement',100.00,1),(112,'105','Premium Flower Stand',280.00,1),(113,'105','Memorial Photo Display Board',150.00,1),(114,'105','Guest Condolence Book',80.00,1),(115,'105','Tea & Coffee Service',170.00,1),(116,'106','Traditional Music Ensemble',400.00,1),(117,'106','VIP Refreshment Package',600.00,1),(118,'106','Professional Photography',370.00,1),(119,'107','Grand Flower Arch',520.00,1),(120,'107','Professional Live Streaming',350.00,1),(121,'107','Traditional Music Ensemble',400.00,1),(122,'107','VIP Refreshment Package',600.00,1),(123,'108','Happy Meal',50.00,1),(124,'108','Fresh Fruit Offering Platter',150.00,1),(125,'110','Happy Meal',50.00,1),(126,'110','Incense and Candle Package',180.00,1),(127,'110','49-Day Memorial Service',5000.00,1);
/*!40000 ALTER TABLE `booking_addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `provider_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `service_date` date NOT NULL,
  `service_time` varchar(50) DEFAULT NULL,
  `service_address` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `special_requirements` text DEFAULT NULL,
  `uploaded_files` text DEFAULT NULL,
  `provider_notes` text DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `cancelled_by` varchar(50) DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`booking_id`),
  KEY `package_id` (`package_id`),
  KEY `idx_status` (`status`),
  KEY `idx_provider` (`provider_id`),
  KEY `idx_service_date` (`service_date`),
  KEY `bookings_user_fk` (`user_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `service_provider` (`provider_id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK000001',15,19,26,'0000-00-00','2025-10-27',NULL,'undefined\n123 Provider Street\nCost: RM 500.00',8330.00,'completed','TAN CHIA LIANG','tcliang2002@gmail.com','+60126108162','hahahh','[\"uploads\\/TEMP_1761281870630_latest_exam_slip_1761281870.png\",\"uploads\\/TEMP_1761281870630_02de4844fa0fb374d03a052af1bbb758f6a9b678_rpt_slipPendaftaranKursus_1761281870.pdf\"]','\nBooking confirmed by provider\nService completed successfully',NULL,NULL,NULL,'2025-10-24 05:41:48',NULL,'pending','bank','2025-10-24 04:57:50','2025-10-24 05:59:15'),(10,'BK000010',22,20,31,'2025-10-15','2025-10-20','09:00','Memorial Hall A, Peaceful Rest, 100 Memorial Avenue',8330.00,'completed','Alice Wong','alice@example.com','+60123456001','Buddhist ceremony preferred',NULL,NULL,NULL,NULL,NULL,'2025-10-15 06:30:00',NULL,'','bank','2025-10-15 02:00:00','2025-10-21 10:00:00'),(11,'BK000011',23,21,34,'2025-10-18','2025-10-25','08:00','Harmony Memorial Hall, 200 Serenity Road',9200.00,'completed','Bob Tan','bob@example.com','+60123456002','Full Buddhist ceremony with vegetarian meals',NULL,NULL,NULL,NULL,NULL,'2025-10-18 07:00:00',NULL,'','card','2025-10-18 03:00:00','2025-10-27 08:00:00'),(12,'BK000012',24,20,30,'2025-10-28','2025-11-05','14:00','Memorial Hall B, Peaceful Rest, 100 Memorial Avenue',3830.00,'confirmed','Carol Lee','carol@example.com','+60123456003','Simple service, no religious ceremony',NULL,NULL,NULL,NULL,NULL,'2025-10-28 03:00:00',NULL,'pending','bank','2025-10-28 01:00:00','2025-10-28 03:00:00'),(13,'BK000013',16,19,37,'2025-10-20','2025-10-26','10:00','Provider 19 Memorial Hall',6180.00,'completed','Customer User 16','user16@example.com','+60123456016','Prefer afternoon service with light refreshments',NULL,NULL,NULL,NULL,NULL,'2025-10-20 05:00:00',NULL,'','card','2025-10-20 01:30:00','2025-10-27 07:00:00'),(14,'BK000014',16,19,38,'2025-10-29','2025-11-08','11:00','Provider 19 Grand Hall',10370.00,'confirmed','Customer User 16','user16@example.com','+60123456016','VIP service with traditional music',NULL,NULL,NULL,NULL,NULL,'2025-10-29 06:00:00',NULL,'pending','bank','2025-10-29 02:00:00','2025-10-29 06:00:00'),(100,'BK000100',16,19,100,'2025-08-05','2025-08-10','09:00','Provider 19 Memorial Hall',3150.00,'completed','Customer User 16','user16@example.com','+60123456016','Simple service preferred',NULL,NULL,NULL,NULL,NULL,'2025-08-05 06:00:00',NULL,'','card','2025-08-05 02:00:00','2025-08-11 07:00:00'),(101,'BK000101',16,19,101,'2025-08-18','2025-08-22','14:00','Provider 19 Memorial Hall',5900.00,'completed','Customer User 16','user16@example.com','+60123456016','Afternoon service with light refreshments',NULL,NULL,NULL,NULL,NULL,'2025-08-18 07:00:00',NULL,'','bank','2025-08-18 03:00:00','2025-08-23 08:00:00'),(102,'BK000102',16,19,102,'2025-09-03','2025-09-08','10:00','Provider 19 Grand Hall',10100.00,'completed','Customer User 16','user16@example.com','+60123456016','Full service with video recording',NULL,NULL,NULL,NULL,NULL,'2025-09-03 05:00:00',NULL,'','card','2025-09-03 01:00:00','2025-09-09 09:00:00'),(103,'BK000103',16,19,101,'2025-09-15','2025-09-20','11:00','Provider 19 Memorial Hall',6050.00,'completed','Customer User 16','user16@example.com','+60123456016','Memorial program booklet needed',NULL,NULL,NULL,NULL,NULL,'2025-09-15 06:30:00',NULL,'','card','2025-09-15 02:30:00','2025-09-21 06:00:00'),(104,'BK000104',16,19,100,'2025-09-25','2025-09-28','15:00','Provider 19 Memorial Hall',3000.00,'completed','Customer User 16','user16@example.com','+60123456016','Basic service',NULL,NULL,NULL,NULL,NULL,'2025-09-25 07:00:00',NULL,'','bank','2025-09-25 03:00:00','2025-09-29 08:00:00'),(105,'BK000105',16,19,101,'2025-10-05','2025-10-10','09:00','Provider 19 Memorial Hall',6180.00,'completed','Customer User 16','user16@example.com','+60123456016','Prefer afternoon service with light refreshments',NULL,NULL,NULL,NULL,NULL,'2025-10-05 05:00:00',NULL,'','card','2025-10-05 01:30:00','2025-10-11 07:00:00'),(106,'BK000106',16,19,102,'2025-10-20','2025-10-26','10:00','Provider 19 Grand Hall',10370.00,'completed','Customer User 16','user16@example.com','+60123456016','VIP service with traditional music',NULL,NULL,NULL,NULL,NULL,'2025-10-20 06:00:00',NULL,'','bank','2025-10-20 02:00:00','2025-10-27 06:00:00'),(107,'BK000107',16,19,102,'2025-10-29','2025-11-08','11:00','Provider 19 Grand Hall',10370.00,'confirmed','Customer User 16','user16@example.com','+60123456016','VIP service with traditional music',NULL,NULL,NULL,NULL,NULL,'2025-10-29 06:00:00',NULL,'pending','bank','2025-10-29 02:00:00','2025-10-29 06:00:00'),(108,'BK000108',15,19,100,'0000-00-00','2025-11-13',NULL,'\nMcdonald\nCost: RM 0.00',3000.00,'cancelled','NINGNING','tcliang2002@gmail.com','+60126108162','I want free food','[\"uploads\\/TEMP_1761757876515_timetable_1761757876.png\",\"uploads\\/TEMP_1761757876515_Student_card_tancl_1761757876.pdf\"]','\ntry another date','we are busy at that date. sorry','provider','2025-10-29 17:16:10',NULL,3000.00,'pending','bank','2025-10-29 17:11:16','2025-10-29 17:16:10'),(109,'BK000109',15,19,101,'0000-00-00','2025-11-19',NULL,'undefined\n196, Jln Balik Pulau,\nCost: RM 500.00',6000.00,'pending','TAN CHIA LIANG','tcliang2002@gmail.com','+60126108162','','[\"uploads\\/TEMP_1762449791014_Context_Diagram__2__1762449791.png\",\"uploads\\/TEMP_1762449791014_543ec6bc-16f2-4117-98b2-47c3de3593b0_1762449791.png\"]',NULL,NULL,NULL,NULL,NULL,NULL,'pending','bank','2025-11-06 17:23:11','2025-11-06 17:23:11'),(110,'BK000110',15,19,101,'0000-00-00','2025-11-19',NULL,'undefined\n196, Jln Balik Pulau,\nCost: RM 500.00',11230.00,'pending','Karina','karina@gmail.com','+60126108162','I want free flowers please','[\"uploads\\/TEMP_1762449877738_Screenshot_2025-09-11_154919_1762449877.png\",\"uploads\\/TEMP_1762449877738_Screenshot_2025-09-11_154919_1762449877.png\"]',NULL,NULL,NULL,NULL,NULL,NULL,'pending','ewallet','2025-11-06 17:24:37','2025-11-06 17:24:37');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memories_database`
--

DROP TABLE IF EXISTS `memories_database`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `memories_database` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `memory_text` text NOT NULL,
  `memory_type` enum('story','quote','habit','other') DEFAULT 'other',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tribute_id` (`tribute_id`),
  CONSTRAINT `fk_memories_tribute` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memories_database`
--

LOCK TABLES `memories_database` WRITE;
/*!40000 ALTER TABLE `memories_database` DISABLE KEYS */;
INSERT INTO `memories_database` VALUES (1,2,'She like to say come home early','story','2025-10-25 09:28:53'),(2,2,'she speaks chinese','','2025-10-25 09:28:53');
/*!40000 ALTER TABLE `memories_database` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_features`
--

DROP TABLE IF EXISTS `package_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `package_features` (
  `feature_id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `feature_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`feature_id`),
  KEY `idx_package_id` (`package_id`),
  CONSTRAINT `package_features_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_features`
--

LOCK TABLES `package_features` WRITE;
/*!40000 ALTER TABLE `package_features` DISABLE KEYS */;
INSERT INTO `package_features` VALUES (23,26,'Deluxe Funeral 1','2025-10-23 11:45:47'),(24,26,'Deluxe Funeral 2','2025-10-23 11:45:47'),(25,30,'Basic Casket','2025-10-29 16:30:05'),(26,30,'Embalming Service','2025-10-29 16:30:05'),(27,30,'Memorial Hall (12 hours)','2025-10-29 16:30:05'),(28,30,'Standard Hearse','2025-10-29 16:30:05'),(29,31,'Premium Wooden Casket','2025-10-29 16:30:05'),(30,31,'Professional Embalming','2025-10-29 16:30:05'),(31,31,'Private Memorial Hall (24 hours)','2025-10-29 16:30:05'),(32,31,'Luxury Hearse Service','2025-10-29 16:30:05'),(33,31,'Floral Arrangements','2025-10-29 16:30:05'),(34,31,'Photo/Video Documentation','2025-10-29 16:30:05'),(35,32,'Designer Casket with Custom Interior','2025-10-29 16:30:05'),(36,32,'Premium Embalming & Restoration','2025-10-29 16:30:05'),(37,32,'Grand Memorial Hall (36 hours)','2025-10-29 16:30:05'),(38,32,'Fleet of Luxury Vehicles','2025-10-29 16:30:05'),(39,32,'Premium Floral Decorations','2025-10-29 16:30:05'),(40,32,'Professional Photography & Videography','2025-10-29 16:30:05'),(41,32,'Memorial Book & Guest Registry','2025-10-29 16:30:05'),(42,32,'Catering Service for 150 Guests','2025-10-29 16:30:05'),(43,33,'Buddhist Casket with Lotus Design','2025-10-29 16:30:05'),(44,33,'Single Monk Chanting Service','2025-10-29 16:30:05'),(45,33,'Buddhist Altar Setup','2025-10-29 16:30:05'),(46,33,'Incense and Candle Package','2025-10-29 16:30:05'),(47,34,'Premium Buddhist Casket','2025-10-29 16:30:05'),(48,34,'Triple Monk Chanting Ceremony','2025-10-29 16:30:05'),(49,34,'Elaborate Buddhist Altar','2025-10-29 16:30:05'),(50,34,'Lotus Lamp Set (108 pcs)','2025-10-29 16:30:05'),(51,34,'Vegetarian Buffet (50 pax)','2025-10-29 16:30:05'),(52,34,'Buddhist Scripture Set','2025-10-29 16:30:05'),(53,35,'Luxury Buddhist Casket with Gold Accents','2025-10-29 16:30:05'),(54,35,'Full Monk Assembly (7 monks)','2025-10-29 16:30:05'),(55,35,'Grand Buddhist Altar with Buddha Statue','2025-10-29 16:30:05'),(56,35,'Complete 7-Day Memorial Service','2025-10-29 16:30:05'),(57,35,'Vegetarian Buffet (100 pax)','2025-10-29 16:30:05'),(58,35,'Buddhist Prayer Flags & Decorations','2025-10-29 16:30:05'),(59,35,'Premium Cremation Service','2025-10-29 16:30:05'),(60,35,'Columbarium Niche (1 year)','2025-10-29 16:30:05'),(61,36,'Basic Wooden Casket','2025-10-29 16:43:01'),(62,36,'Simple Embalming','2025-10-29 16:43:01'),(63,36,'Small Memorial Room (8 hours)','2025-10-29 16:43:01'),(64,36,'Basic Transportation','2025-10-29 16:43:01'),(65,37,'Quality Wooden Casket','2025-10-29 16:43:01'),(66,37,'Professional Embalming','2025-10-29 16:43:01'),(67,37,'Medium Memorial Hall (16 hours)','2025-10-29 16:43:01'),(68,37,'Premium Hearse','2025-10-29 16:43:01'),(69,37,'Flower Wreath Set','2025-10-29 16:43:01'),(70,37,'Memorial Program Booklet','2025-10-29 16:43:01'),(71,38,'Luxury Mahogany Casket','2025-10-29 16:43:01'),(72,38,'Expert Embalming & Cosmetics','2025-10-29 16:43:01'),(73,38,'Large Memorial Hall (30 hours)','2025-10-29 16:43:01'),(74,38,'Executive Hearse & Family Car','2025-10-29 16:43:01'),(75,38,'Designer Floral Arrangements','2025-10-29 16:43:01'),(76,38,'Professional Video Recording','2025-10-29 16:43:01'),(77,38,'Memorial Website Creation','2025-10-29 16:43:01'),(78,38,'Refreshments for 100 Guests','2025-10-29 16:43:01'),(79,100,'Basic Wooden Casket','2025-10-29 16:52:24'),(80,100,'Simple Embalming','2025-10-29 16:52:24'),(81,100,'Small Memorial Room (8 hours)','2025-10-29 16:52:24'),(82,100,'Basic Transportation','2025-10-29 16:52:24'),(83,101,'Quality Wooden Casket','2025-10-29 16:52:24'),(84,101,'Professional Embalming','2025-10-29 16:52:24'),(85,101,'Medium Memorial Hall (16 hours)','2025-10-29 16:52:24'),(86,101,'Premium Hearse','2025-10-29 16:52:24'),(87,101,'Flower Wreath Set','2025-10-29 16:52:24'),(88,101,'Memorial Program Booklet','2025-10-29 16:52:24'),(89,102,'Luxury Mahogany Casket','2025-10-29 16:52:24'),(90,102,'Expert Embalming & Cosmetics','2025-10-29 16:52:24'),(91,102,'Large Memorial Hall (30 hours)','2025-10-29 16:52:24'),(92,102,'Executive Hearse & Family Car','2025-10-29 16:52:24'),(93,102,'Designer Floral Arrangements','2025-10-29 16:52:24'),(94,102,'Professional Video Recording','2025-10-29 16:52:24'),(95,102,'Memorial Website Creation','2025-10-29 16:52:24'),(96,102,'Refreshments for 100 Guests','2025-10-29 16:52:24');
/*!40000 ALTER TABLE `package_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packages` (
  `package_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `duration_hours` decimal(5,2) DEFAULT NULL,
  `location_type` enum('home','venue','both') DEFAULT 'both',
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`package_id`),
  KEY `idx_provider` (`provider_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_is_featured` (`is_featured`),
  CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `service_provider` (`provider_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (22,19,'Basic Service 16','Essential funeral service package',2500.00,10,10.00,'home',1,0,'2025-10-23 09:57:14','2025-10-23 11:45:54'),(23,19,'Premium Service 16','Comprehensive funeral service',5000.00,NULL,NULL,'venue',1,0,'2025-10-23 09:57:14','2025-10-23 11:46:00'),(26,19,'Deluxe Funeral Service','Complete luxury funeral service',7500.00,500,36.00,'both',1,0,'2025-10-23 10:26:16','2025-10-23 11:45:47'),(30,20,'Basic Farewell Package','Essential funeral service with basic amenities',3500.00,50,12.00,'venue',1,0,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(31,20,'Premium Memorial Package','Comprehensive funeral service with premium amenities',7500.00,100,24.00,'both',1,1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(32,20,'Deluxe Celebration of Life','Complete luxury funeral service with personalized touches',12000.00,150,36.00,'both',1,1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(33,21,'Buddhist Basic Service','Traditional Buddhist funeral ceremony',4000.00,60,18.00,'venue',1,0,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(34,21,'Buddhist Premium Service','Complete Buddhist funeral with monks and chanting',8500.00,120,48.00,'both',1,1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(35,21,'Buddhist Deluxe Service','Elaborate Buddhist ceremony with 7-day memorial',15000.00,200,72.00,'both',1,1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(36,19,'Essential Memorial Service','Simple and dignified funeral service',2800.00,40,8.00,'venue',1,0,'2025-10-29 16:43:01','2025-10-29 16:43:01'),(37,19,'','',0.00,NULL,NULL,'both',1,0,'2025-10-29 16:43:01','2025-11-07 07:28:55'),(38,19,'','',0.00,NULL,NULL,'both',1,0,'2025-10-29 16:43:01','2025-11-07 07:32:34'),(100,19,'Essential Memorial Service','Simple and dignified funeral service',2800.00,40,8.00,'venue',1,0,'2025-10-29 16:52:24','2025-10-29 16:52:24'),(101,19,'','',0.00,NULL,NULL,'both',1,1,'2025-10-29 16:52:24','2025-11-07 07:22:52'),(102,19,'Premium Tribute Service','Comprehensive memorial with premium features',9500.00,120,30.00,'both',1,1,'2025-10-29 16:52:24','2025-10-29 16:52:24');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personality_traits`
--

DROP TABLE IF EXISTS `personality_traits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personality_traits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `trait_category` varchar(50) NOT NULL,
  `trait_value` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tribute_id` (`tribute_id`),
  CONSTRAINT `fk_traits_tribute` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personality_traits`
--

LOCK TABLES `personality_traits` WRITE;
/*!40000 ALTER TABLE `personality_traits` DISABLE KEYS */;
INSERT INTO `personality_traits` VALUES (1,2,'interests','She like to play golf','2025-10-25 09:28:53');
/*!40000 ALTER TABLE `personality_traits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_activity_log`
--

DROP TABLE IF EXISTS `profile_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profile_activity_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action_type` enum('profile_update','password_change','account_deactivation','account_reactivation','account_deletion') NOT NULL,
  `action_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `profile_activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_activity_log`
--

LOCK TABLES `profile_activity_log` WRITE;
/*!40000 ALTER TABLE `profile_activity_log` DISABLE KEYS */;
INSERT INTO `profile_activity_log` VALUES (1,16,'profile_update','{\"provider_id\":19,\"updated_fields\":[\"provider_id\",\"company_name\",\"business_type\",\"business_registration\",\"description\",\"address\",\"city\",\"state\",\"postal_code\",\"phone\",\"email\",\"website\",\"operating_hours\",\"services_offered\",\"facebook_url\",\"instagram_url\"],\"timestamp\":\"2025-10-28 07:59:30\"}','2025-10-28 06:59:30'),(2,16,'profile_update','{\"provider_id\":19,\"updated_fields\":[\"provider_id\",\"company_name\",\"business_type\",\"business_registration\",\"description\",\"address\",\"city\",\"state\",\"postal_code\",\"phone\",\"email\",\"website\",\"operating_hours\",\"services_offered\",\"facebook_url\",\"instagram_url\"],\"timestamp\":\"2025-10-28 18:58:27\"}','2025-10-28 17:58:27'),(3,16,'profile_update','{\"provider_id\":19,\"updated_fields\":[\"provider_id\",\"company_name\",\"business_type\",\"business_registration\",\"description\",\"address\",\"city\",\"state\",\"postal_code\",\"phone\",\"email\",\"website\",\"operating_hours\",\"services_offered\",\"facebook_url\",\"instagram_url\"],\"timestamp\":\"2025-10-28 19:19:50\"}','2025-10-28 18:19:50');
/*!40000 ALTER TABLE `profile_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_addons`
--

DROP TABLE IF EXISTS `provider_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provider_addons` (
  `addon_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `addon_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_custom` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`addon_id`),
  KEY `template_id` (`template_id`),
  KEY `idx_provider_active` (`provider_id`,`is_active`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `provider_addons_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `service_provider` (`provider_id`) ON DELETE CASCADE,
  CONSTRAINT `provider_addons_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `addon_templates` (`template_id`) ON DELETE SET NULL,
  CONSTRAINT `provider_addons_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `addon_categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_addons`
--

LOCK TABLES `provider_addons` WRITE;
/*!40000 ALTER TABLE `provider_addons` DISABLE KEYS */;
INSERT INTO `provider_addons` VALUES (1,19,2,'49-Day Memorial Service','Complete 49-day memorial services with weekly prayer sessions',5000.00,1,1,0,'2025-10-23 10:23:20','2025-11-08 16:45:49'),(2,19,11,'Incense and Candle Package','Premium incense sticks and ceremonial candles for 3-day ceremony',180.00,2,1,0,'2025-10-23 10:23:24','2025-10-23 10:23:24'),(3,19,16,'Fresh Fruit Offering Platter','Traditional fruit offerings including apples, oranges, and bananas',150.00,3,1,0,'2025-10-23 10:23:28','2025-10-23 10:23:28'),(4,19,NULL,'Happy Meal','Happy all the day',50.00,9,1,1,'2025-10-23 10:23:42','2025-10-23 10:23:42');
/*!40000 ALTER TABLE `provider_addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_availability`
--

DROP TABLE IF EXISTS `provider_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provider_availability` (
  `availability_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `date_unavailable` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`availability_id`),
  UNIQUE KEY `unique_provider_date` (`provider_id`,`date_unavailable`),
  KEY `idx_provider_date` (`provider_id`,`date_unavailable`),
  CONSTRAINT `provider_availability_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `service_provider` (`provider_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_availability`
--

LOCK TABLES `provider_availability` WRITE;
/*!40000 ALTER TABLE `provider_availability` DISABLE KEYS */;
INSERT INTO `provider_availability` VALUES (6,19,'2025-11-02','Not available','2025-10-28 18:27:17'),(7,19,'2025-11-03','Not available','2025-10-28 18:27:17'),(8,19,'2025-11-04','Not available','2025-10-28 18:27:17'),(9,19,'2025-11-05','Not available','2025-10-28 18:27:17'),(10,19,'2025-11-06','Not available','2025-10-28 18:27:17'),(11,19,'2025-11-07','Not available','2025-10-28 18:27:17'),(12,19,'2025-11-08','Not available','2025-10-28 18:27:17'),(13,19,'2025-11-09','Not available','2025-10-28 18:27:17'),(14,19,'2025-11-10','Not available','2025-10-28 18:27:17'),(15,19,'2025-11-11','Not available','2025-10-28 18:27:17'),(16,19,'2025-11-12','Not available','2025-10-28 18:27:17');
/*!40000 ALTER TABLE `provider_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_reviews`
--

DROP TABLE IF EXISTS `provider_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provider_reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `reviewer_user_id` int(11) DEFAULT NULL,
  `provider_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `review_category` varchar(50) DEFAULT 'quality',
  `review_type` enum('customer_to_provider','provider_to_customer') DEFAULT 'customer_to_provider',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`review_id`),
  KEY `idx_provider` (`provider_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_reviewer_user_id` (`reviewer_user_id`),
  KEY `provider_reviews_ibfk_3` (`booking_id`),
  CONSTRAINT `provider_reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_reviews`
--

LOCK TABLES `provider_reviews` WRITE;
/*!40000 ALTER TABLE `provider_reviews` DISABLE KEYS */;
INSERT INTO `provider_reviews` VALUES (2,15,19,1,5,'good!','quality','customer_to_provider','2025-10-24 07:04:02','2025-10-24 07:04:02'),(10,22,20,10,5,'Exceptional service during our difficult time. The staff was compassionate, professional, and handled every detail with care. The memorial service was beautiful and exactly what our family needed. Highly recommend Peaceful Rest!','quality','customer_to_provider','2025-10-22 02:00:00','2025-10-29 16:30:05'),(11,23,21,11,5,'Outstanding Buddhist funeral service! The monks were respectful and the chanting ceremony was conducted perfectly. The vegetarian food was excellent and the staff coordinated everything smoothly. Very satisfied with Harmony Memorial Services.','quality','customer_to_provider','2025-10-28 06:30:00','2025-10-29 16:30:05'),(12,16,19,13,5,'Excellent service from start to finish! The staff was very attentive and respectful. They handled everything professionally and made a difficult time much easier for our family. The memorial hall was beautiful and well-maintained. Highly recommend this provider!','quality','customer_to_provider','2025-10-27 08:30:00','2025-10-29 16:43:01'),(13,16,19,NULL,4,'Great facilities and caring staff. The only minor issue was parking availability during peak hours. Otherwise, everything was perfect and the service exceeded our expectations.','quality','customer_to_provider','2025-10-28 03:00:00','2025-10-29 16:43:01'),(100,16,19,100,5,'Very professional and caring service. The staff made everything so easy during a difficult time. Thank you for your kindness.','quality','customer_to_provider','2025-08-12 02:00:00','2025-10-29 16:52:24'),(101,16,19,101,4,'Good service overall. The memorial hall was nice and the staff were helpful. Only minor issue was parking availability.','quality','customer_to_provider','2025-08-24 03:30:00','2025-10-29 16:52:24'),(102,16,19,102,5,'Excellent premium service! The video recording was beautifully done and the grand hall was stunning. Highly recommend!','quality','customer_to_provider','2025-09-10 06:00:00','2025-10-29 16:52:24'),(103,16,19,103,5,'Great service and attention to detail. The memorial program booklet was perfect. Thank you for everything.','quality','customer_to_provider','2025-09-22 07:30:00','2025-10-29 16:52:24'),(104,16,19,105,5,'Excellent service from start to finish! The staff was very attentive and respectful. They handled everything professionally and made a difficult time much easier for our family. The memorial hall was beautiful and well-maintained. Highly recommend this provider!','quality','customer_to_provider','2025-10-12 08:30:00','2025-10-29 16:52:24'),(105,16,19,106,4,'Great facilities and caring staff. The traditional music was a beautiful touch. The only minor issue was parking availability during peak hours. Otherwise, everything was perfect and the service exceeded our expectations.','quality','customer_to_provider','2025-10-28 03:00:00','2025-10-29 16:52:24');
/*!40000 ALTER TABLE `provider_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_provider`
--

DROP TABLE IF EXISTS `service_provider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_provider` (
  `provider_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `company_name` varchar(200) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `business_type` varchar(100) DEFAULT NULL,
  `business_registration` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `operating_hours` text DEFAULT NULL,
  `services_offered` text DEFAULT NULL,
  `average_price` decimal(10,2) DEFAULT NULL,
  `total_packages` int(11) DEFAULT 0,
  `logo` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`provider_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_rating` (`rating`),
  KEY `idx_email` (`email`),
  CONSTRAINT `service_provider_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_provider`
--

LOCK TABLES `service_provider` WRITE;
/*!40000 ALTER TABLE `service_provider` DISABLE KEYS */;
INSERT INTO `service_provider` VALUES (19,16,'Nirvana','https://example.com/logo.jpg','Funeral Services','A1563','Professional funeral services','196, Jln Balik Pulau,','Ayer Itam','Penang','11500','+1234567890','nirvana@test.com','https://nirvana-asia-pg.com/','https://www.facebook.com/NirvanaAsiaLtd/','https://www.instagram.com/nirvanafunerals.my/','24/7 hours','\"\\\"\\\\\\\"\\\\\\\"\\\"\"',3344.44,9,NULL,4.67,9,1,1,'2025-10-23 09:57:14','2025-11-07 07:32:34'),(20,20,'Peaceful Rest Funeral Services',NULL,'Funeral Services','BR20250001','Compassionate funeral services with 20 years of experience','100 Memorial Avenue','Puchong','Kuala Lumpur','50000','+60123456789','peacefulrest@example.com','https://peacefulrest.com',NULL,NULL,'24/7 Service Available','[\"Traditional Funeral\", \"Cremation\", \"Memorial Services\"]',7666.67,3,NULL,5.00,1,0,1,'2025-10-29 16:30:05','2025-10-29 17:08:53'),(21,21,'Harmony Memorial Services',NULL,'Funeral Services','BR20250002','Modern funeral services with Buddhist traditions','200 Serenity Road','Bukit Tinggi','Johor','11500','+60198765432','harmony@example.com','https://harmony-memorial.com',NULL,NULL,'Mon-Sun 8AM-10PM','[\"Buddhist Ceremony\", \"Cremation\", \"Columbarium\"]',9166.67,3,NULL,5.00,1,0,1,'2025-10-29 16:30:05','2025-10-29 17:09:06');
/*!40000 ALTER TABLE `service_provider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tribute_messages`
--

DROP TABLE IF EXISTS `tribute_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tribute_messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `sender_name` varchar(100) NOT NULL,
  `sender_email` varchar(100) DEFAULT NULL,
  `message` text NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`message_id`),
  KEY `idx_tribute` (`tribute_id`),
  CONSTRAINT `tribute_messages_ibfk_1` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tribute_messages`
--

LOCK TABLES `tribute_messages` WRITE;
/*!40000 ALTER TABLE `tribute_messages` DISABLE KEYS */;
INSERT INTO `tribute_messages` VALUES (16,2,'Giselle','giselle@gmail.com','Bye Bye my friend. I will miss you','uploads/tributes/tribute_message_690cb11ee5888_1762439454.jpg',1,'2025-11-06 14:30:54'),(17,2,'Moka','moka@gmail.com','Sayonara kawanku.','uploads/tributes/tribute_message_690cb13fa3793_1762439487.webp',1,'2025-11-06 14:31:27');
/*!40000 ALTER TABLE `tribute_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tribute_photos`
--

DROP TABLE IF EXISTS `tribute_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tribute_photos` (
  `photo_id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `caption` text DEFAULT NULL,
  `uploaded_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`photo_id`),
  KEY `idx_tribute` (`tribute_id`),
  CONSTRAINT `tribute_photos_ibfk_1` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tribute_photos`
--

LOCK TABLES `tribute_photos` WRITE;
/*!40000 ALTER TABLE `tribute_photos` DISABLE KEYS */;
INSERT INTO `tribute_photos` VALUES (4,2,'uploads/tributes/family_gallery_690cb0a6ac1c8_1762439334.jpg','Family Photo','user1','2025-11-06 14:28:54'),(5,2,'uploads/tributes/family_gallery_690cb0c325b6e_1762439363.webp','Family Reunion','user1','2025-11-06 14:29:23');
/*!40000 ALTER TABLE `tribute_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tribute_rsvp`
--

DROP TABLE IF EXISTS `tribute_rsvp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tribute_rsvp` (
  `rsvp_id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `attendee_name` varchar(100) NOT NULL,
  `attendee_email` varchar(100) DEFAULT NULL,
  `attendee_phone` varchar(20) DEFAULT NULL,
  `will_attend` tinyint(1) DEFAULT 1,
  `attendance_type` varchar(20) DEFAULT 'physical',
  `number_of_guests` int(11) DEFAULT 1,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rsvp_id`),
  KEY `idx_tribute` (`tribute_id`),
  CONSTRAINT `tribute_rsvp_ibfk_1` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tribute_rsvp`
--

LOCK TABLES `tribute_rsvp` WRITE;
/*!40000 ALTER TABLE `tribute_rsvp` DISABLE KEYS */;
INSERT INTO `tribute_rsvp` VALUES (1,2,'TAN CHIA LIANG','tcliang2002@gmail.com','0126108162',0,'not-attending',4,'','2025-10-24 11:54:12'),(2,2,'Giselle','tcliang2002@gmail.com','0126108162',1,'physical',3,'','2025-10-24 12:03:43'),(3,2,'JINGGGG','tcliang2002@gmail.com','0126108162',0,'not-attending',3,'','2025-10-24 15:34:48'),(4,2,'jason','tcliang2002@gmail.com','0126108162',1,'physical',1,'','2025-10-29 10:50:40');
/*!40000 ALTER TABLE `tribute_rsvp` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER update_attendance_type_on_will_attend_change

BEFORE UPDATE ON tribute_rsvp

FOR EACH ROW

BEGIN

    -- If will_attend is being changed and attendance_type is not explicitly set

    IF NEW.will_attend != OLD.will_attend THEN

        IF NEW.will_attend = 1 THEN

            -- If someone manually sets will_attend to 1, default to physical unless they specify virtual

            IF NEW.attendance_type IS NULL OR NEW.attendance_type = 'not-attending' THEN

                SET NEW.attendance_type = 'physical';

            END IF;

        ELSE

            -- If will_attend is set to 0, they're not attending

            SET NEW.attendance_type = 'not-attending';

        END IF;

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tributes`
--

DROP TABLE IF EXISTS `tributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tributes` (
  `tribute_id` int(11) NOT NULL AUTO_INCREMENT,
  `deceased_name` varchar(100) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `death_date` date DEFAULT NULL,
  `biography` text DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 1,
  `view_count` int(11) DEFAULT 0,
  `flower_count` int(11) DEFAULT 0,
  `slug` varchar(200) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `life_story` text DEFAULT NULL,
  `allow_messages` tinyint(1) DEFAULT 1,
  `enable_rsvp` tinyint(1) DEFAULT 1,
  `grave_location_name` varchar(255) DEFAULT NULL,
  `grave_address` text DEFAULT NULL,
  `donation_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`donation_items`)),
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_account_name` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `donation_qr_code` varchar(255) DEFAULT NULL,
  `location_of_birth` text DEFAULT NULL,
  `grave_invite_message` text DEFAULT NULL,
  `grave_datetime` datetime DEFAULT NULL,
  `map_link` varchar(500) DEFAULT NULL,
  `virtual_link` varchar(500) DEFAULT NULL,
  `allow_photos` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`tribute_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `created_by` (`created_by`),
  KEY `idx_slug` (`slug`),
  KEY `idx_public` (`is_public`),
  CONSTRAINT `tributes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tributes`
--

LOCK TABLES `tributes` WRITE;
/*!40000 ALTER TABLE `tributes` DISABLE KEYS */;
INSERT INTO `tributes` VALUES (1,'Test Person','2025-10-03','2025-10-24','This is a test tribute to verify the system works.','uploads/tributes/portrait_68fe1154a2c99_1761481044.jpg',1,16,0,NULL,15,'2025-10-24 07:26:52','2025-10-26 12:17:26','bye bye',1,1,NULL,NULL,NULL,'123456','jing','maybank','','Johor',NULL,NULL,NULL,NULL,1),(2,'Johnny','2025-10-09','2025-10-25','I like america','uploads/tributes/portrait_68fb3278c9245_1761292920.jpg',1,421,13,NULL,15,'2025-10-24 08:02:00','2025-11-07 04:05:31','I am so sad\n',1,1,'Peaceful Rest Cemetery','123 Memorial Drive, Peaceful Rest Cemetery, City, State 12345','[{\"name\":\"Memorial Flowers\",\"description\":\"Beautiful flower arrangements for the memorial service\",\"price\":50,\"image\":\"flowers.jpg\"},{\"name\":\"Charity Donation\",\"description\":\"Donation to favorite charity in memory of the deceased\",\"price\":100,\"image\":\"charity.jpg\"},{\"name\":\"Memory Book\",\"description\":\"Contribute to a memory book with photos and messages\",\"price\":25,\"image\":\"book.jpg\"}]','1234567890','Johnny Memorial Fund','First National Bank','uploads/tributes/qr_68fb5513e8814_1761301779.png','America','Come to my Funeral please','2025-10-17 18:14:00','https://maps.app.goo.gl/NH2vAbvdksYuCC3YA','https://meet.google.com/wqg-bkks-trn',1);
/*!40000 ALTER TABLE `tributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('family','guest','provider') NOT NULL DEFAULT 'guest',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_id` (`id`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (15,15,'user1','user1','tcliang2002@gmail.com','$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',NULL,NULL,NULL,'family',1,'2025-10-23 05:34:29','2025-10-28 05:22:24'),(16,16,'provider1','provider1','provider1@gmail.com','$2y$10$lk8zx4H6KepIJ2.lCI9cLuCkqRo5VNGX9mlIpZQMyGcWzmKQnrRhq',NULL,NULL,NULL,'provider',1,'2025-10-23 06:35:55','2025-10-28 05:22:24'),(20,20,'Peaceful Rest','peacefulrest','peacefulrest@example.com','$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',NULL,NULL,NULL,'provider',1,'2025-10-29 16:30:04','2025-10-29 16:30:04'),(21,21,'Harmony Memorial','harmonymemorial','harmony@example.com','$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',NULL,NULL,NULL,'provider',1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(22,22,'Alice Wong','alicewong','alice@example.com','$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',NULL,NULL,NULL,'family',1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(23,23,'Bob Tan','bobtan','bob@example.com','$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',NULL,NULL,NULL,'family',1,'2025-10-29 16:30:05','2025-10-29 16:30:05'),(24,24,'Carol Lee','carollee','carol@example.com','$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',NULL,NULL,NULL,'family',1,'2025-10-29 16:30:05','2025-10-29 16:30:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voice_chat_settings`
--

DROP TABLE IF EXISTS `voice_chat_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voice_chat_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `is_enabled` tinyint(1) DEFAULT 1,
  `access_level` enum('public','family','private') DEFAULT 'family',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tribute_id` (`tribute_id`),
  CONSTRAINT `fk_voice_chat_settings_tribute` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voice_chat_settings`
--

LOCK TABLES `voice_chat_settings` WRITE;
/*!40000 ALTER TABLE `voice_chat_settings` DISABLE KEYS */;
INSERT INTO `voice_chat_settings` VALUES (1,2,1,'family','2025-10-29 04:12:33','2025-10-29 04:12:33');
/*!40000 ALTER TABLE `voice_chat_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voice_conversations`
--

DROP TABLE IF EXISTS `voice_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voice_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `user_input` text DEFAULT NULL,
  `ai_response` text DEFAULT NULL,
  `audio_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tribute_id` (`tribute_id`),
  CONSTRAINT `voice_conversations_ibfk_1` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voice_conversations`
--

LOCK TABLES `voice_conversations` WRITE;
/*!40000 ALTER TABLE `voice_conversations` DISABLE KEYS */;
INSERT INTO `voice_conversations` VALUES (6,2,'hi how are you','Hey there! I\'m doing great, thanks for asking. How about you?',NULL,'2025-10-29 05:13:26'),(7,2,'I really miss you','Aww, I miss you too! Come home early so we can hang out, okay?',NULL,'2025-10-29 05:27:49'),(8,2,'I really miss you','I miss you too! Come home early, okay? Let\'s spend some time together.',NULL,'2025-10-29 05:31:56'),(9,2,'How are you?','I\'m doing great! Just thinking about playing some golf later. How about you?',NULL,'2025-10-29 05:37:40'),(10,2,'How have you been?','I\'ve been pretty good, thanks! Been practicing my golf swing a lot lately. How about you?',NULL,'2025-10-29 06:10:05'),(11,2,'im fine','That\'s great to hear! If you\'re free later, maybe we can play some golf together?',NULL,'2025-10-29 07:43:12'),(12,2,'yea sure','Awesome! Let\'s meet at the golf course around 3 PM then. Can\'t wait!',NULL,'2025-10-29 07:46:10');
/*!40000 ALTER TABLE `voice_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voice_models`
--

DROP TABLE IF EXISTS `voice_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voice_models` (
  `voice_id` int(11) NOT NULL AUTO_INCREMENT,
  `tribute_id` int(11) NOT NULL,
  `elevenlabs_voice_id` varchar(255) NOT NULL,
  `audio_sample_path` varchar(500) DEFAULT NULL,
  `sample_duration` int(11) DEFAULT NULL,
  `status` enum('processing','ready','failed') DEFAULT 'processing',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`voice_id`),
  KEY `tribute_id` (`tribute_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `voice_models_ibfk_1` FOREIGN KEY (`tribute_id`) REFERENCES `tributes` (`tribute_id`) ON DELETE CASCADE,
  CONSTRAINT `voice_models_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voice_models`
--

LOCK TABLES `voice_models` WRITE;
/*!40000 ALTER TABLE `voice_models` DISABLE KEYS */;
INSERT INTO `voice_models` VALUES (2,2,'mock_voice_68fc96a6afd80','voice_sample_2_1761384100.webm',NULL,'ready',15,'2025-10-25 09:21:42');
/*!40000 ALTER TABLE `voice_models` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10  2:03:16

