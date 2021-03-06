import { Itinerary, Spot, ItineraryMap } from '../models/itinerary';
import { SqlStorage } from 'ionic-angular';

/**
 * ItineraryDAO class is responsible for saving and retrieving
 * information about Itineraries from the memory.
 * 
 * @class {ItineraryDAO}
 */
export class ItineraryDAO {

    private collectionName: string = 'itineraries';
    private storage: SqlStorage;

    public constructor() {
        this.storage = new SqlStorage();
    }

    /**
     * @private
     * Retrieves the ItineraryMap stored in the memory.
     * @return {Promise<ItineraryMap>}
     */
    private get Storage(): Promise<ItineraryMap> {
        return new Promise<ItineraryMap>((resolve) => {
            this.storage.get(this.collectionName).then((content: string) => {
                if (!content) resolve(new ItineraryMap());
                else {
                    let data: any = JSON.parse(content);
                    let map: ItineraryMap = new ItineraryMap();
                    let lines: string[] = Object.keys(data.itineraries);
                    lines.forEach( line => {
                        let it: any = data.itineraries[line];
                        let spots: Spot[] = [];
                        it.spots.forEach(sp => spots.push(new Spot(sp.latitude, sp.longitude, sp.returning)));
                        map.save(new Itinerary(it.line, it.description, it.agency, spots));
                    });
                    resolve(map);
                }
            });
        });
    }

    /**
     * @private
     * Saves an ItineraryMap to the memory.
     * @param {ItineraryMap} obj - map of itineraries
     * @return {Promise<void>}
     */
    private set(obj: ItineraryMap): Promise<void> {
        return this.storage.set(this.collectionName, JSON.stringify(obj));
    }

    /**
     * Retrieves an Itinerary from the memory.
     * @param {string} line - Itinerary line identifier
     * @return {Promise<Itinerary>} 
     */
    public get(line: string): Promise<Itinerary> {
        return new Promise<Itinerary>(resolve => this.Storage.then( map => resolve(map.get(line))));
    }

    /**
     * Saves an Itinerary instance to the memory
     * @param {Itinerary} obj - Itinerary instance
     * @return {Promise<boolean>}
     */
    public save(obj: Itinerary): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Storage.then((map: ItineraryMap) => {
                map.save(obj);
                this.set(map).then(() => resolve(true));
            });
        });
    }

    /**
     * Removes an Itinerary instance from the memory
     * @param {Itinerary} obj - Itinerary instance
     * @return {Promise<boolean>}
     */
    public remove(obj: Itinerary): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Storage.then((map: ItineraryMap) => {
                map.remove(obj);
                this.set(map).then(() => resolve(true));
            });
        });
    }
}
