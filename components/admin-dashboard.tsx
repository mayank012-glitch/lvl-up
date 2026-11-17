"use client";
import {useState} from 'react';import type {ContentRecord} from '@/lib/content';import {ContentAdmin} from './content-admin';import {ParticipantsAdmin} from './participants-admin';import {ResultsAdmin} from './results-admin';
import {StationsAdmin} from './stations-admin';import type {StationDetails} from '@/lib/stations';
export function AdminDashboard({initial,initialStations}:{initial:ContentRecord[];initialStations:StationDetails[]}){const [events,setEvents]=useState(initial);return <><ContentAdmin initial={initial} onChanged={setEvents}/><StationsAdmin initial={initialStations}/><ParticipantsAdmin events={events}/><ResultsAdmin events={events}/></>;}
