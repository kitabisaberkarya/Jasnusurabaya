import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit as fbLimit, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// A simple in-memory cache to handle sequential mock operations safely
class SupabaseQueryBuilder {
  constructor(private table: string) {}

  private _select: string = '*';
  private _filters: any[] = [];
  private _orFilters: string[] = [];
  private _limit?: number;
  private _order?: { column: string; options?: { ascending: boolean } };
  private _maybeSingle: boolean = false;
  private _single: boolean = false;

  select(columns: string) {
    this._select = columns;
    return this;
  }

  eq(column: string, value: any) {
    this._filters.push({ column, operator: '==', value });
    return this;
  }
  
  in(column: string, values: any[]) {
    this._filters.push({ column, operator: 'in', value: values });
    return this;
  }

  or(conditions: string) {
    // Basic parser for "email.eq.foo,nia.eq.foo"
    this._orFilters.push(conditions);
    return this;
  }

  limit(n: number) {
    this._limit = n;
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    this._order = { column, options };
    return this;
  }

  maybeSingle() {
    this._maybeSingle = true;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  then(resolve: any, reject: any) {
    const execute = async () => {
      try {
        const colRef = collection(db, this.table);
        let qFinal = query(colRef);
        
        let results: any[] = [];
        const constraints: any[] = [];
        
        for (const f of this._filters) {
            constraints.push(where(f.column, f.operator as any, f.value));
        }
        if (this._order) {
            constraints.push(orderBy(this._order.column, this._order.options?.ascending === false ? 'desc' : 'asc'));
        }
        if (this._limit && this._orFilters.length === 0 && this._filters.length > 0) {
            constraints.push(fbLimit(this._limit));
        }

        qFinal = query(colRef, ...constraints);
        const snapshot = await getDocs(qFinal);
        snapshot.forEach(doc => {
            let data = doc.data();
            if (!data.id && typeof data.id !== 'string') {
                 data.id = doc.id;
            }
            if (data.id && !isNaN(Number(data.id))) {
                data.id = Number(data.id);
            }
            results.push(data);
        });

        if (this._orFilters.length > 0) {
            results = results.filter(item => {
                for (const orCond of this._orFilters) {
                    const conditions = orCond.split(',');
                    let matchAny = false;
                    for (const cond of conditions) {
                        const parts = cond.split('.');
                        if (parts.length >= 3) {
                            const field = parts[0];
                            const op = parts[1];
                            const value = parts.slice(2).join('.');
                            if (op === 'eq' && String(item[field]) === value) matchAny = true;
                        }
                    }
                    if (!matchAny) return false;
                }
                return true;
            });
        }

        if (this._limit) {
            results = results.slice(0, this._limit);
        }

        if (this._single || this._maybeSingle) {
            if (results.length === 0) {
                if (this._single) return { data: null, error: { message: 'Row not found' } };
                return { data: null, error: null };
            }
            return { data: results[0], error: null };
        }

        return { data: results, error: null };
      } catch (error) {
        console.error("Supabase mock query error for table", this.table, error);
        return { data: null, error };
      }
    };
    return execute().then(resolve, reject);
  }

  // MUTATIONS
  async insert(data: any[]) {
      try {
          const colRef = collection(db, this.table);
          if (data.length === 1) {
              const item = data[0];
              // Use slug as doc if if profile
              if (this.table === 'profile_pages' && item.slug) {
                  await setDoc(doc(colRef, item.slug), item);
                  return { data: [item], error: null };
              }
              const docRef = await addDoc(colRef, item);
              await updateDoc(docRef, { id: docRef.id }); // optional: sync ID
              return { data: [{...item, id: docRef.id}], error: null };
          } else {
              const batch = writeBatch(db);
              data.forEach(item => {
                  const docRef = doc(colRef);
                  batch.set(docRef, item);
              });
              await batch.commit();
              return { data, error: null };
          }
      } catch(error) {
          return { data: null, error };
      }
  }

  update(data: any) {
      return {
          eq: async (column: string, value: any) => {
              try {
                  const snapshot = await getDocs(query(collection(db, this.table), where(column, '==', value)));
                  const batch = writeBatch(db);
                  snapshot.forEach(d => {
                      batch.update(d.ref, data);
                  });
                  await batch.commit();
                  return { data: null, error: null };
              } catch(error) {
                  return { data: null, error };
              }
          }
      };
  }

  delete() {
      return {
          eq: async (column: string, value: any) => {
              try {
                  const snapshot = await getDocs(query(collection(db, this.table), where(column, '==', value)));
                  const batch = writeBatch(db);
                  snapshot.forEach(d => {
                      batch.delete(d.ref);
                  });
                  await batch.commit();
                  return { data: null, error: null };
              } catch(error) {
                  return { data: null, error };
              }
          },
          in: async (column: string, values: any[]) => {
               try {
                  const batch = writeBatch(db);
                  // Firestore 'in' is limited to 10. Split into chunks.
                  for (let i = 0; i < values.length; i += 10) {
                      const chunk = values.slice(i, i + 10);
                      const snapshot = await getDocs(query(collection(db, this.table), where(column, 'in', chunk)));
                      snapshot.forEach(d => {
                          batch.delete(d.ref);
                      });
                  }
                  await batch.commit();
                  return { data: null, error: null };
              } catch(error) {
                  return { data: null, error };
              }
          }
      };
  }

  async upsert(data: any[], options?: any) {
      try {
          const batch = writeBatch(db);
          data.forEach(item => {
              let docId = item.id ? String(item.id) : (item.slug ? item.slug : null);
              let docRef = docId ? doc(collection(db, this.table), docId) : doc(collection(db, this.table));
              batch.set(docRef, item, { merge: true });
          });
          await batch.commit();
          return { data, error: null };
      } catch(error) {
          return { data: null, error };
      }
  }
}

export const supabase = {
  from: (table: string) => {
      return new SupabaseQueryBuilder(table);
  }
};
