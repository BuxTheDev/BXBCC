-- Seed: Bryan's real structure. Values left at 0 where not known — fill in the app.

insert into roles (name, commitment, sort) values
 ('Husband & father','Present, provider, steward of the household',1),
 ('Operator','Cozii, Valley of Grace, TerraLift, Salvo — BOI converted into ABI',2),
 ('Student','Finish the degree sprint; certs that articulate',3),
 ('Veteran & CVOR tech','The W2 that funds the transition; medical-device sales next',4),
 ('Steward','From Self-Made to God-Led — the frame the numbers answer to',5);

insert into entities (id, name, kind, jurisdiction, notes) values
 ('11111111-1111-1111-1111-111111111101','Wyoming Holdco','holdco','WY','Top of the structure (name TBD)'),
 ('11111111-1111-1111-1111-111111111102','Snowbook Properties LLC','propco','NV','PropCo over Valley of Grace'),
 ('11111111-1111-1111-1111-111111111103','Valley of Grace Recovery Home LLC','opco','NV','Level 2 recovery residence, North Las Vegas'),
 ('11111111-1111-1111-1111-111111111104','BXB International','opco','AZ','Cozii Housing — Phoenix Metro MTR'),
 ('11111111-1111-1111-1111-111111111105','TerraLift','opco','AZ','Vacant land wholesaling, 12-state buy-box'),
 ('11111111-1111-1111-1111-111111111106','DJ Assets LLC','propco','WY','Asset holding'),
 ('11111111-1111-1111-1111-111111111107','Financial Literacy Nonprofit','nonprofit','AZ','501(c)(3) — course delivery'),
 ('11111111-1111-1111-1111-111111111108','BrightPath Real Estate Solutions, LLC','opco','AZ','LOI buyer entity used by Salvo'),
 ('11111111-1111-1111-1111-111111111109','Personal','personal','AZ','Bryan & Stephanie');
update entities set parent_id='11111111-1111-1111-1111-111111111101' where id in
 ('11111111-1111-1111-1111-111111111102','11111111-1111-1111-1111-111111111104','11111111-1111-1111-1111-111111111105','11111111-1111-1111-1111-111111111106');
update entities set parent_id='11111111-1111-1111-1111-111111111102' where id='11111111-1111-1111-1111-111111111103';

insert into goals (id, name, metric, target_value, unit, horizon, why, sort) values
 ('22222222-2222-2222-2222-222222222201','$30M net worth by 30','net_worth',30000000,'USD',null,'The number the whole structure serves',1),
 ('22222222-2222-2222-2222-222222222202','Replace W2 with property management income','abi_monthly',0,'USD/mo',null,'ABI is the exit from labor income',2),
 ('22222222-2222-2222-2222-222222222203','Finish bachelor''s degree','courses_done',0,'courses',null,'Credential for the sales transition',3),
 ('22222222-2222-2222-2222-222222222204','Move into medical-device sales','milestone',1,'',null,'Leverages CVOR background; better LI while BOI→ABI matures',4);
update goals set parent_id='22222222-2222-2222-2222-222222222201' where id='22222222-2222-2222-2222-222222222202';

insert into fronts (name, rank, current_state, next_action, why, income_class, entity_id, goal_id, place) values
 ('Valley of Grace launch',1,'Beds, house manager, referrals','Hire house manager; work referral list','Fulfillment first, income second','BOI','11111111-1111-1111-1111-111111111103','22222222-2222-2222-2222-222222222202','North Las Vegas, NV'),
 ('Cozii owner acquisition',2,'Lead-source list 8/17 signed up','Finish remaining platform signups; book discovery calls','Property management is the W2 replacement','BOI','11111111-1111-1111-1111-111111111104','22222222-2222-2222-2222-222222222202','Phoenix Metro, AZ'),
 ('Salvo build & launch',3,'Engine unified; landing page live; PDF pending','Ship in-app LOI PDF; founding-25 cohort','KBI that funds ABI','KBI','11111111-1111-1111-1111-111111111105',null,'Remote / 12-state buy-box'),
 ('MTR toolkit ($27 → $147)',4,'Assets gathered from MTR Resources','Package front-end product','KBI, low effort, reuses Cozii assets','KBI','11111111-1111-1111-1111-111111111104',null,'Online'),
 ('Degree sprint',5,'Sophia gen-eds in progress','Verify Sophia→WGU articulations; order JST','Credential for sales transition','LI','11111111-1111-1111-1111-111111111109','22222222-2222-2222-2222-222222222203','Online'),
 ('Medical-device sales transition',6,'Exploring','Build target list of device companies in Phoenix','Higher LI while ABI compounds','LI','11111111-1111-1111-1111-111111111109','22222222-2222-2222-2222-222222222204','Phoenix Metro, AZ'),
 ('ADU/casita buy-and-hold',7,'Buy-box set: $400–550k, mid-tier+, any 2nd unit','Find capital partner for entry + furnishing','Direct ABI; Cozii feeds it','ABI','11111111-1111-1111-1111-111111111104','22222222-2222-2222-2222-222222222201','Phoenix Metro, AZ');

insert into pipelines (id, slug, name, venture, sort) values
 ('33333333-3333-3333-3333-333333333301','tl-acq','TerraLift — Acquisition','terralift',1),
 ('33333333-3333-3333-3333-333333333302','tl-dispo','TerraLift — Disposition','terralift',2),
 ('33333333-3333-3333-3333-333333333303','cozii-owners','Cozii — Owner Acquisition','cozii',3),
 ('33333333-3333-3333-3333-333333333304','cozii-bookings','Cozii — Bookings','cozii',4),
 ('33333333-3333-3333-3333-333333333305','vog-intake','Valley of Grace — Intake','valley_of_grace',5),
 ('33333333-3333-3333-3333-333333333306','knowledge','Knowledge Products','knowledge',6);

insert into pipeline_stages (pipeline_id, name, sort, win_probability, is_terminal)
select '33333333-3333-3333-3333-333333333301', s, i, p, t from (values
 ('List imported',1,0.02,false),('Underwritten',2,0.05,false),('LOI sent',3,0.08,false),('Response',4,0.2,false),
 ('Negotiation',5,0.4,false),('Under contract',6,0.8,false),('Assigned / Closed',7,1,true)) v(s,i,p,t);
insert into pipeline_stages (pipeline_id, name, sort, win_probability, is_terminal)
select '33333333-3333-3333-3333-333333333302', s, i, p, t from (values
 ('Buyer sourced',1,0.1,false),('Matched to deal',2,0.3,false),('Offer out',3,0.6,false),('Closed',4,1,true)) v(s,i,p,t);
insert into pipeline_stages (pipeline_id, name, sort, win_probability, is_terminal)
select '33333333-3333-3333-3333-333333333303', s, i, p, t from (values
 ('Lead',1,0.05,false),('Discovery call booked',2,0.2,false),('Proposal sent',3,0.4,false),('Agreement signed',4,0.9,false),('Onboarding',5,0.95,false),('Live',6,1,true)) v(s,i,p,t);
insert into pipeline_stages (pipeline_id, name, sort, win_probability, is_terminal)
select '33333333-3333-3333-3333-333333333304', s, i, p, t from (values
 ('Inquiry',1,0.1,false),('Quoted',2,0.3,false),('Held',3,0.6,false),('Confirmed',4,0.95,false),('Checked in',5,1,false),('Checked out',6,1,true)) v(s,i,p,t);
insert into pipeline_stages (pipeline_id, name, sort, win_probability, is_terminal)
select '33333333-3333-3333-3333-333333333305', s, i, p, t from (values
 ('Referral received',1,0.2,false),('Screened',2,0.4,false),('Interviewed',3,0.6,false),('Bed offered',4,0.8,false),('Moved in',5,1,false),('Discharged',6,1,true)) v(s,i,p,t);
insert into pipeline_stages (pipeline_id, name, sort, win_probability, is_terminal)
select '33333333-3333-3333-3333-333333333306', s, i, p, t from (values
 ('Lead',1,0.05,false),('Front-end bought',2,0.5,false),('Upsold',3,0.8,false),('Managed / Subscribed',4,1,true)) v(s,i,p,t);

insert into organizations (name, kind) values
 ('CRS Temporary Housing','relocation network'),('ALE Solutions','insurance housing'),('Furnished Finder','MTR platform'),
 ('Sedgwick (tacares.com)','insurance housing'),('United Corporate Housing','corporate housing'),('Dabella Consulting','consulting');

insert into classification_rules (match_text, income_class, category, sort) values
 ('%banner%','LI','W2 salary',1),('%VA %','SI','VA benefit',2),('%GI Bill%','SI','Education benefit',3),
 ('%airbnb%','ABI','MTR income',4),('%furnished finder%','ABI','MTR income',5),('%stripe%','KBI','Digital product',6),('%fiverr%','KBI','Freelance',7);
